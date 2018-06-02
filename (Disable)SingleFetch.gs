//
//
//function procFetch() {
//  
//  var csvMode = false;
//  
//  var cfgKeyValues = getConfigKeyValues();
//  var nodeKeyValues = getNodeKeyValues();
//  
//  
//  
//  //initial values
//  var keyValues = cfgKeyValues;
//  
//  var trgGSUrl = keyValues['trgGSUrl'];
//  var csvMSUrl = keyValues['csvMSUrl'];
//  var trgShName = keyValues['trgShName']; 
//  var trgControlShName = keyValues['trgControlShName'];
//  var NodeName = keyValues['NodeName'];
//  var nodeShName = keyValues['nodeShName'];
//  var tagSrcCurrentCnt = keyValues['tagSrcCurrentCnt'];
//  var tagSTName = keyValues['tagSTName'];
//  var tagSrcStockHeader = keyValues['tagSrcStockHeader'];
//  var tagSrcToTrgRowHeader = keyValues['tagSrcToTrgRowHeader'];
//  var tagSrcDataRng = keyValues['tagSrcDataRng'];
//  var tagSrcCSVRng = keyValues['tagSrcCSVRng'];
//  var tagSrcCSVHeardCell = keyValues['tagSrcCSVHeardCell'];
//  var tagTrgDataStartCol = keyValues['tagTrgDataStartCol'];
//  var tagTrgDataEndCol = keyValues['tagTrgDataEndCol'];
//  var tagSrcRunStatus = keyValues['tagSrcRunStatus'];
//  var tagSrcLastRunTime = keyValues['tagSrcLastRunTime'];
//  var timeUp = Number(keyValues['timeUp']);
//  var DataFetchNumber = Number(keyValues['DataFetchNumber']);
//  var tagValidation =  keyValues['tagValidation'];
//  
//  
//  //key value in node
//  keyValues = nodeKeyValues;
//  var enable = Number(keyValues['enable'])
//  var currentCnt = Number(keyValues['currentCnt'])
//  var totalCnt = Number(keyValues['totalCnt']);
//  
//
// 
//  
//  //initial obj 
//  var shNode = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nodeShName);
//  var shTrgWb = SpreadsheetApp.openByUrl(trgGSUrl);
//  var shSummary = shTrgWb.getSheetByName(trgShName);
//  var shAll = shTrgWb.getSheetByName(trgControlShName);
//  
//  //data sheet
//  var rngCurST = [];
//  var rngCurCnt = [];
//  var rngSrcData = [];
//  var rngSrcCSV = [];
////  var rngSTHead = [];
////  var rngRowHead = [];
//  // for data sheet define
//  var shData =[];
//  for( var dataN = 1 ; dataN <= DataFetchNumber; dataN++){
//    if( dataN <=9){
//      var dataS ='0'+ dataN;
//    }else{
//      var dataS = dataN.toString();
//    }
//    var dataSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('D'+ dataS);
//    
//    rngCurST[dataN] = dataSh.getRange(tagSTName);
//    rngCurCnt[dataN]= dataSh.getRange(tagSrcCurrentCnt);
//    rngSrcData[dataN]= dataSh.getRange(tagSrcDataRng);
//    rngSrcCSV[dataN]= dataSh.getRange(tagSrcCSVRng);
////    rngSTHead[dataN]= dataSh.getRange(tagSrcStockHeader);
////    rngRowHead[dataN]= dataSh.getRange(tagSrcToTrgRowHeader);
//    shData[dataN] = dataSh;
//  }
//  
//  
//  
//  
//  
//  //initial range obj  
//  var rngCurCntAll = shNode.getRange(tagSrcCurrentCnt);
//  var rngCurSTAll = shNode.getRange(tagSTName);
//  var rngSTHead = shNode.getRange(tagSrcStockHeader);
//  var rngRowHead = shNode.getRange(tagSrcToTrgRowHeader);
//  
//  //Get Stock List
//
//  var stockListTmp = rngSTHead.offset(1, 0, totalCnt).getValues();
//  var stockList = [];
//  for( var i=1;i<=totalCnt;i++){
//    stockList[i] = stockListTmp[i-1][0];
//  }
//  
//  //Get RowList
//  
//  //Get Stock List
//  var rowListTmp = rngRowHead.offset(1, 0, totalCnt).getValues();
//  var rowList = [];
//  for( var i=1;i<=totalCnt;i++){
//    rowList[i] = rowListTmp[i-1][0];
//  }
//  
//
//  //Get Current Stock index
//  if(currentCnt <= 1){
//    var curStIndex = 1;
//  }else{
//    var curStIndex = currentCnt - 1;
//  }
//  
//  dataN = 0;
//  var dataRow = [];
//  var dataStock = [];
//  var dataIdx = [];
//  var dataSend = []
//  
//  var nbSecPause = 1;
//  const NB_RETRY = 3;
//  
//  var nbErr = 0;
//  
//  
//  for( var run = curStIndex; run <= totalCnt; run++){
//    
//    //initial dataN;
//    if(dataN == DataFetchNumber){
//      dataN = 1;
//    }else{
//      dataN = dataN + 1;
//    }
//    
//    //var remainRun = totalCnt - run + 1;
//    
//    
//    // current stock name
//    var currentStock = stockList[run]
//    var currentidx = run;
//    dataRow[dataN]= rowList[run];
//    dataStock[dataN] = currentStock;
//    dataIdx[dataN] = currentidx;
//    
//    //set Stock and csv  for each data sheet
//    
//    //check if any node is avaliable
//     
//    //Set Stock
//    rngCurCnt[dataN].setValue(currentidx);
//    rngCurST[dataN].setValue('');
//    SpreadsheetApp.flush();
//    
//    //setCsv
//    nbErr = 0;
//    var validateStatus = 0;
//    do { 
//      if(!csvMode){
//        rngCurST[dataN].setValue(currentStock);
//        //SpreadsheetApp.flush();
//        sleep(500);
//      }else{
//        var currentCSVUrl =csvMSUrl + currentStock;
//        setCsvSuccess = importCSVFromWeb(currentCSVUrl, shData[dataN],tagSrcCSVHeardCell);
//        if(!setCsvSuccess){
//          rngSrcCSV[dataN].clear({contentsOnly: true, skipFilteredRows: true});
//        }else{
//          rngCurST[dataN].setValue(currentStock);
//          SpreadsheetApp.flush();
//        }
//      }
//      validateStatus =  Number(shData[dataN].getRange(tagValidation).getValue());
//      if( validateStatus == 1 ){
//        dataSend[dataN] = 1;
//        nbErr = NB_RETRY;
//      }else{
//        dataSend[dataN] = 0;
//        nbErr = nbErr + 1;
//        Logger.log(currentStock+" Fetch data failed!");
//        sleep(nbSecPause*1000);
//      }
//      
//    } while (nbErr < NB_RETRY) ;   
//
//    //sync data only when meet DataFetchNumber or totalCnt
//    if( dataN == DataFetchNumber || run == totalCnt ){
//
//    
//      for(var i = 1 ; i<= dataN ; i ++){
//        
//        if(dataSend[i] == 0 ) continue;
//        
//        //prepare obj
//        var srcRng = rngSrcData[i];
//        var trgRow = dataRow[i];
//        var trgRndAggress = tagTrgDataStartCol + trgRow +':'+tagTrgDataEndCol+trgRow;
//        var trgRng = shSummary.getRange(trgRndAggress);
//        
//        var values = srcRng.getValues();
//        trgRng.setValues(values);
//        
//        // mark S_ALL set Value
//        shNode.getRange(tagSTName).setValue(currentStock);
//        shNode.getRange(tagSrcCurrentCnt).setValue(currentidx);
//      }
//    }
//    
//  }
//  
//  
//}
//
//
//
//
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
