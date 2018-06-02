//function onChange(e){
//  var rng = e.range;
//  Logger.log('Value Changed...');
//  //processChange(rng);
//}
//
//function processChange(rng){  
//  var cfgKeyValues = getConfigKeyValues();
//  var tagSTName = cfgKeyValues['tagSTName'];
//  
//  
//  if(rng.getA1Notation() === tagSTName && rng.getValues() !=='' ){
//    
//    var tagSTName = cfgKeyValues['tagShName'];
//    var sh = rng.getSheet()
//    var shName = sh.getName();
//    var curShName = sh.getRange(tagSTName).getValue();
//    if( shName!==null || curShName === shName){
//      Logger.log('Trigger dataFetch...');
//      datdFetch(shName);
//    }
//  }
//}



function testDataFetch(){
  var name ='D01';
  var keyValues = {};
  keyValues['name'] = name;
  keyValues['status']='0'; // 0: ready for process, -1: processing
  keyValues['lastRunTime'] = getGoogleSheetDateNumber();
  keyValues['stockName']='BIG'
  keyValues['stockRow']=4;
  keyValues['stockIdx']=-1;
  
  putDataFetchStatusToCache(name,keyValues);
  
  removeKeyValuesFromCache('_Config_Key_Value');
  
  
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  sh.getRange('G2').setValue('');
  sh.getRange('G2').setValue(keyValues['stockName']);
  
  dataFetch(keyValues);
  
}


function createSpreadsheetChangeTrigger() {
    var ss = SpreadsheetApp.getActive();
    ScriptApp.newTrigger('onChange')
      .forSpreadsheet(ss)
      .onChange()
      .create();
  
}  




function dataFetch(dataKeyValues){

  var csvMode = true;
  
  var cfgKeyValues = getConfigKeyValues();
//  var dataKeyValues = getDataFecthStatusFromCache(name);
  
  //
  var curTime = getGoogleSheetDateNumber();
  var nodeShName = cfgKeyValues['nodeShName'];
  var shNode = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nodeShName);
  
  //mark data fetcher is working
  //changeDataFetchStatus(shNode,dataKeyValues,-1)
  

  
  // continue initial values
  var trgGSUrl = cfgKeyValues['trgGSUrl'];
  var trgShName = cfgKeyValues['trgShName']; 
  
  var tagTrgDataEndCol = cfgKeyValues['tagTrgDataEndCol'];
  var tagTrgDataStatusCol = cfgKeyValues['tagTrgDataStatusCol'];
  var tagTrgDataLastRunTimeCol = cfgKeyValues['tagTrgDataLastRunTimeCol'];

  var tagSTName = cfgKeyValues['tagSTName'];
  var tagSrcDataRng = cfgKeyValues['tagSrcDataRng'];
  var tagSrcCSVRng = cfgKeyValues['tagSrcCSVRng'];
  var tagSrcCSVHeardCell = cfgKeyValues['tagSrcCSVHeardCell'];
  var tagSrcEnable = cfgKeyValues['tagSrcEnable'];
  var tagTrgDataStartCol = cfgKeyValues['tagTrgDataStartCol'];
  var tagValidation =  cfgKeyValues['tagValidation'];  
  var csvMSUrl = cfgKeyValues['csvMSUrl'];

  //initial obj 
  var shTrgWb = SpreadsheetApp.openByUrl(trgGSUrl);
  var shSummary = shTrgWb.getSheetByName(trgShName);
  
  
  //Get Basic Info form cache
  var stockName = dataKeyValues['stockName'];
  var status = dataKeyValues['status'];
  var stockRow = dataKeyValues['stockRow'];
  var stockIdx = dataKeyValues['stockIdx'];
   
  
  // initial Obj
  var name  = dataKeyValues['name'];
  var dataSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  var rngSrcData= dataSh.getRange(tagSrcDataRng);
  var rngSrcCSV= dataSh.getRange(tagSrcCSVRng);
  var rngCurST = dataSh.getRange(tagSTName);
  var rngCurEnable = dataSh.getRange(tagSrcEnable);
  var rngCurValid = dataSh.getRange(tagValidation);
  
  var trgSTStatusAddress = tagTrgDataStatusCol + stockRow;
  var trgSTLRTAddress = tagTrgDataLastRunTimeCol + stockRow;
  var trgStatus = shSummary.getRange(trgSTStatusAddress);
  var trgLastRunTime = shSummary.getRange(trgSTLRTAddress);
  var trgRndAggress = tagTrgDataStartCol + stockRow + ':' + tagTrgDataEndCol + stockRow;
  var trgRng = shSummary.getRange(trgRndAggress);
  
//status judge stock current status from summary and decide how to process
  var curStatusS = trgStatus.getValue();
  var curLastRunTimeS = trgLastRunTime.getValue();
  
  if(curLastRunTimeS === null || curLastRunTimeS =='' ){
    var curLastRunTimeN = 0;
  }else{
    var curLastRunTimeN =  convertToGoogleSheetNumber(Number(curLastRunTimeS));
  }
  
  if( curStatusS === null || curStatusS ===''){
   var curStatusN = 0;
  }else{
   var curStatusN = Number(curStatusS);
  }
  
  var continueStatus = false;
  if(curStatusN == 99){
    continueStatus = false;
  }else if(curStatusN == -1){
    //if pending over 5 mins, need rerun
    if(  ((curTime - curLastRunTimeN)*24*60)  >= 3 ){
      curStatusN = 0;
      continueStatus = true;
    }else{
      continueStatus = false;
    }
  }else if( curStatusN == 0){
    //normal, run if over one day
    if(  ((curTime - curLastRunTimeN))  >= 1 ){
      continueStatus = true;
    }else{
      continueStatus = false;
    }
  }else if( curStatusN >= 1 && curStatusN <= 4){
    //re run mode
    continueStatus = true;    
  }else{
    Logger.log('Unknow StockStatus : ' + curStatusN);
    continueStatus = false;
  }
  
  // still need run?
  if( continueStatus == false ){
    //changeDataFetchStatus(shNode,dataKeyValues,0);
    return;
  }else{
    //start try send data
    trgStatus.setValue(-1);
    trgLastRunTime.setValue(curTime);
  }
  
  var oldRunCnt = curStatusN;
  var setCsvSuccess = false;
  var currentCSVUrl = csvMSUrl + stockName;
  
  
  
  //start try send data
  trgStatus.setValue(-1);
  trgLastRunTime.setValue(curTime);
  rngCurST.setValue(stockName);
  
  var nbErr = 0;
  var NB_RETRY = 1;
  var validateStatus = 0;
  var curSendData =  false;
  
  
  
  do {
    
    rngCurEnable.setValue(0);
    
    if(!csvMode){
      rngCurEnable.setValue(1);
      sleep(500);
    }else{
      if(!setCsvSuccess){
        if(nbErr ==0){
          rngSrcCSV.clear({contentsOnly: true, skipFilteredRows: true});
        }
        setCsvSuccess = importCSVFromWeb(currentCSVUrl, dataSh,tagSrcCSVHeardCell);
      }
      
      if(setCsvSuccess){
        rngCurEnable.setValue(1);
        //SpreadsheetApp.flush();
        //sleep(500);
      }
    }
//    var add = rngCurValid.getA1Notation();
    var validateStatusS =  rngCurValid.getValue();
    validateStatus =  Number(validateStatusS);
    if( validateStatus == 1 ){
      curSendData = true;
      break;
    }else{
      nbErr = nbErr + 1;
      sleep(500);
    }
    
  } while (nbErr < NB_RETRY) ; 
  
  if(curSendData){
    
    //copy data
    var srcData = rngSrcData.getValues();
    trgRng.setValues(srcData);
    
    //update status
    trgStatus.setValue(0);
    trgLastRunTime.setValue(curTime);
    
  }else{
    //update status
    trgStatus.setValue(oldRunCnt + 1);
    trgLastRunTime.setValue(curTime);
    
  }
  
  //changeDataFetchStatus(shNode,dataKeyValues,0,curTime);
  
}

function changeDataFetchStatus(sh, dataKeyValues,status){
  dataKeyValues['status'] = status;
  dataKeyValues['lastRunTime'] = getGoogleSheetDateNumber();
  syncDataFetchStatus(sh,dataKeyValues);
}



function syncDataFetchStatus(sh, dataKeyValues){
  
  var cfgKeyValues = getConfigKeyValues();
  var status = Number(dataKeyValues['status']);
  var lastRunTime = Number(dataKeyValues['lastRunTime']);
  
  var tagSrcRunStatus = cfgKeyValues['tagSrcRunStatus'];
  var tagSrcLastRunTime = cfgKeyValues['tagSrcLastRunTime'];
  
  sh.getRange(tagSrcRunStatus).setValue(status);
  sh.getRange(tagSrcLastRunTime).setValue(lastRunTime); 
  putDataFetchStatusToCache(sh.getName(),dataKeyValues);
}
