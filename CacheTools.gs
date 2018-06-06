
function removeConfigKeyValuesFromCache(){
 var tag = '_Config_Key_Value';
 var cache = CacheService.getDocumentCache();
 cache.remove(tag);
}



function getConfigKeyValues(){
  var tag = '_Config_Key_Value';
  var keyValues =  getKeyValuesToFromCache(tag);
  if(keyValues === null ){
    keyValues = createConfigKeyValues();
    syncKeyValuesToCache(tag,keyValues);
  }
  return keyValues;
}

function getNodeKeyValues(){
var tag = '_Node_Key_Value';
//  var keyValues =  getKeyValuesToFromCache(tag);
  var keyValues = null;
  if(keyValues === null ){
    keyValues = createNodeKeyValues();
    syncKeyValuesToCache(tag,keyValues);
  }
  return keyValues;
}

function createNodeKeyValues(){
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Node');
  if(sh ===  null) return;  
  var rng = sh.getRange('F1:G20');
  var keyValues = getKeyValuesFromRange(rng); 
  return keyValues;
}

function createConfigKeyValues(){ 
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Config');
  if(sh ===  null) return;  
  var rng = sh.getRange('C:D');
  var keyValues = getKeyValuesFromRange(rng); 
  return keyValues;
}




//Common use functions


function syncKeyValuesToCache(tag,keyValues){ 
  //Sync To cache
  var cache = CacheService.getDocumentCache();
  var keyValuesJSONStr = JSON.stringify(keyValues);
  cache.put(tag, keyValuesJSONStr,86400);
}

function getKeyValuesToFromCache(tag){ 
  //Sync To cache
  var cache = CacheService.getDocumentCache();
  var obj = cache.get(tag);
  var keyValues = null;
  if( obj !== null && obj !== 'undefined'){
    var keyValues = JSON.parse(obj);
  }
  return keyValues;
}


function removeKeyValuesFromCache(tag){
  var cache = CacheService.getDocumentCache();
  cache.remove(tag);
}


function creatDataFetchStatus(name){
  var keyValues = {};
  keyValues['name'] = name;
  keyValues['status']='0'; // 0: ready for process, -1: processing
  keyValues['lastRunTime'] = new Date().getTime()/86400000;
  keyValues['stockName']=''
  keyValues['stockRow']=-1;
  keyValues['stockIdx']=-1;
  
  return keyValues;
}


function removeDataFecthStatusFromCache(name){
  var tag = 'dataFetch_'+ name +'_status';
  removeKeyValuesFromCache(tag);
}


function getDataFecthStatusFromCache(name){
  var tag = 'dataFetch_'+ name +'_status';
  var keyValues = getKeyValuesToFromCache(tag);
  if(keyValues === null){
    keyValues = creatDataFetchStatus(name);
    syncKeyValuesToCache(tag,keyValues)
  }
  return keyValues;
}

function putDataFetchStatusToCache(name, keyValues){
  var tag = 'dataFetch_'+ name +'_status';
  syncKeyValuesToCache(tag,keyValues);
  
}

function getAllFreeDataFetchStatus(number){
  return getAllDataFetchStatus(number, true);
}

function getAllDataFetchStatus(number, freeOnly){
  var allStatus = [];
  var idx = 0;
  var curTime = new Date().getTime();
  
  for(var dataN = 1; dataN <= number ; dataN++){
    if( dataN <=9){
      var dataS ='0'+ dataN;
    }else{
      var dataS = dataN.toString();
    }   
    var name = 'D' + dataS;
    var tmpStatus = getDataFecthStatusFromCache(name)
    
    var status =  Number(tmpStatus['status']);
    var lastRunTime = Number(tmpStatus['lastRunTime']);
    var secondDiff = (curTime - lastRunTime)/1000
    
    
    if(!freeOnly  || status == 0 || secondDiff >= 150) {
      allStatus[idx] = tmpStatus;
      idx = idx +1;
    }  
  } 
  
  return allStatus;
}

function removeAllDataFetchStatus(number){
  for(var dataN = 1; dataN <= number ; dataN++){
    if( dataN <=9){
      var dataS ='0'+ dataN;
    }else{
      var dataS = dataN.toString();
    }   
    var name = 'D' + dataS;
    removeDataFecthStatusFromCache(name);
  } 
  
}


function test(){
  removeAllDataFetchStatus(20);
  var allstatus = getAllFreeDataFetchStatus(20);
  var l = allstatus.length;
  return;
}
