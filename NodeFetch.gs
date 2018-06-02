

function nodeFetch() {
  
  var csvMode = false;
  
  var cfgKeyValues = getConfigKeyValues();
  var nodeKeyValues = getNodeKeyValues();
  
  var startTimeSec = new Date().getTime()/1000;
  
  var curTimeN = getGoogleSheetDateNumber();
  
  //initial values 
  var trgGSUrl = cfgKeyValues['trgGSUrl'];
  var trgShName = cfgKeyValues['trgShName']; 
  var trgControlShName = cfgKeyValues['trgControlShName'];
  var NodeName = cfgKeyValues['NodeName'];
  var nodeShName = cfgKeyValues['nodeShName'];
 
  var tagSrcCurrentCnt = cfgKeyValues['tagSrcCurrentCnt'];
  var tagSTName = cfgKeyValues['tagSTName'];
  var tagSrcStockHeader = cfgKeyValues['tagSrcStockHeader'];
  var tagSrcToTrgRowHeader = cfgKeyValues['tagSrcToTrgRowHeader'];
  var tagSrcStockStatusHeader = cfgKeyValues['tagSrcStockStatusHeader'];
  var tagSrcStockLUTHeader = cfgKeyValues['tagSrcStockLUTHeader'];
  var tagSrcRunStatus = cfgKeyValues['tagSrcRunStatus'];
  var tagSrcLastRunTime = cfgKeyValues['tagSrcLastRunTime'];
  var tagValidation = cfgKeyValues['tagValidation'];
  var timeUp = Number(cfgKeyValues['timeUp']);
  var tagSrcEnable = cfgKeyValues['tagSrcEnable'];
  
  
  //key value in node
  keyValues = nodeKeyValues;
  var enable = Number(nodeKeyValues['enable'])
  var currentCnt = Number(nodeKeyValues['currentCnt'])
  var totalCnt = Number(nodeKeyValues['totalCnt']);
  var remainCnt = Number(nodeKeyValues['remainCnt'])
  var dataShName = nodeKeyValues['dataShName'];
  var lastRunTimeS = nodeKeyValues['lastRunTime'];
  if( lastRunTimeS === null || lastRunTimeS ===''){
      var lastRunTimeN = 0;
  }else{
      var lastRunTimeN = convertToGoogleSheetNumber(Number(lastRunTimeS));
   
  }
  
  //DECIDE IF PROCESS CONTINUE
  if (remainCnt == 0 && (curTimeN - lastRunTimeN) <= 1 ){
    Logger.log("Process all done, exit....");
    return;
  }else if( enable == 0 ){
    Logger.log("Process Disable, exit....");
    return;
  }
  
  
  //initial obj 
  var shNode = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nodeShName);
  var shTrgWb = SpreadsheetApp.openByUrl(trgGSUrl);
  //var shSummary = shTrgWb.getSheetByName(trgShName);
  var shAll = shTrgWb.getSheetByName(trgControlShName);
  var rngEnable =  shNode.getRange(tagSrcEnable)
  
  var rngNodeStName = shNode.getRange(tagSTName);
  var rngNodeLRT = shNode.getRange(tagSrcLastRunTime);
  
  
  //Prepare StockInfo
  var stockListTmp = shNode.getRange(tagSrcStockHeader).offset(1, 0, totalCnt).getValues();
  var rowListTmp = shNode.getRange(tagSrcToTrgRowHeader).offset(1, 0, totalCnt).getValues();
  var statusListTmp = shNode.getRange(tagSrcStockStatusHeader).offset(1, 0, totalCnt).getValues();
  var lastUpdateTimeListTmp = shNode.getRange(tagSrcStockLUTHeader).offset(1, 0, totalCnt).getValues();

  var stockInfo_Done = [];
  var stockInfo_Pending = [];
  var stockInfo_PendingReRun = [];
  var stockInfo_Run = [];
  var stockInfo_Retry = [];
  var stockInfo_Error = [];
  var stockInfo_Skip = [];
  for( var i=0;i<totalCnt;i++){
    
    var curLastRunTimeS = lastUpdateTimeListTmp[i][0];
    if(curLastRunTimeS === null || curLastRunTimeS =='' ){
      var curLastRunTimeN = 0;
    }else{
      var curLastRunTimeN =  convertToGoogleSheetNumber(Number(curLastRunTimeS));
    }
    
    var curStatusS = statusListTmp[i][0];
    if( curStatusS === null || curStatusS ===''){
      var curStatusN = 0;
    }else{
      var curStatusN = Number(curStatusS);
    }
    
    var info = {
      name: dataShName,
      stockName:stockListTmp[i][0],
      row:Number(rowListTmp[i][0]),
      status:curStatusN,
      lastUpdateTime:curLastRunTimeN,
      index:i+1
    }
    
    if(curStatusN == 99){
      
      stockInfo_Skip.push(info);
      
    }else if(curStatusN == -1){
      
      //if pending over 1 mins, need rerun
      if(  ((curTimeN - curLastRunTimeN)*24*60)  >= 1 ){
        info.status = 0;
        stockInfo_PendingReRun.push(info);
      }else{
        stockInfo_Pending.push(info);
      }
      
    }else if( curStatusN == 0){
      
      //normal, run if over one day
      if(  ((curTimeN - curLastRunTimeN))  >= 1 ){
        stockInfo_Run.push(info);
      }else{
        stockInfo_Done.push(info);
      }
      
    }else if( curStatusN >= 1 && curStatusN <= 4){
      //re run mode
      stockInfo_Retry.push(info);
      
    }else if( curStatusN >= 5 ){
      
      stockInfo_Error.push(info); 
    }else{
      
      Logger.log('Unknow StockStatus : ' + curStatusN);
    }
    
 
  }
  
  //decide if need run Seperated to  infos
  //1. run 2.retry 3.pending run 
  var stockInfo_All = [
    stockInfo_Run,
    stockInfo_Retry,
    stockInfo_PendingReRun
  ]
  
  
  
  for( var setIdx = 0  ; setIdx < stockInfo_All.length; setIdx++){
    
    var stockInfoTmp = stockInfo_All[setIdx];
    if(stockInfoTmp.length == 0 )continue;
    
    Logger.log('Process stock set : ' + setIdx );
    
    for( var run = 0 ;  run < stockInfoTmp.length; run++){
      
      //judge if still enable
      var enableN = Number(rngEnable.getValue());
      if( enableN != 1 ){
        Logger.log("FetchNode was diasble, exit now.");
        SpreadsheetApp.flush();
        return;
      }
      
      var stockInfo = stockInfoTmp[run];
      //process for single stock
      
      processDataFetch(stockInfo);
      
      //mark to sheet
      rngNodeStName.setValue(stockInfo.stockName);
      rngNodeLRT.setValue(getGoogleSheetDateNumber());
      
      //exit before maxium process run time 
      var curTimeSec = (new Date().getTime()/1000);
      if( (curTimeSec - startTimeSec ) >= 270){
        Logger.log('Time exceeded Limited, exit now.'); 
        SpreadsheetApp.flush();
        return;
      }
      
    }
    
    
  }
  
  rngNodeLRT.setValue(getGoogleSheetDateNumber());
  Logger.log('Normal Process Done, restart again.');
  
  nodeFetch();
}


function processDataFetch(stockInfo){
  
  var keyValues = {};
  keyValues['name'] = stockInfo.name;
  keyValues['status']=stockInfo.status; // 0: ready for process, -1: processing
  keyValues['lastRunTime'] = getGoogleSheetDateNumber();
  keyValues['stockName']=stockInfo.stockName;
  keyValues['stockRow']=stockInfo.row;
  keyValues['stockIdx']=stockInfo.index 
  
  
  dataFetch(keyValues);

  
}



//function createWbChangeTrigger() {
//    var wb = SpreadsheetApp.getActiveSpreadsheet();
//    ScriptApp.newTrigger('onChange')
//      .forSpreadsheet(wb)
//      .onChange()
//      .create();
//}
//
//function deleteWbChangeTrigger() {
//  // Loop over all triggers.
//  var allTriggers = ScriptApp.get;
//  for (var i = 0; i < allTriggers.length; i++) {
//    var kk = allTriggers[i].getEventType();
//    // If the current trigger is the correct one, delete it.
//   // if (allTriggers[i].getEventType() ) {
//      //ScriptApp.deleteTrigger(allTriggers[i]);
//      break;
//    //}
//  }
//}




