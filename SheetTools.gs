function myFunction() {
  SpreadsheetApp.flush();
}


function cleanSheet(){
  reSetSheet(false);
}

function rebuildSheet(){
  reSetSheet(true);
}


function reSetSheet(rebuild){
  var shTotalCnt = 20;
  //var shNameRngAdr = 'F1';
  
  var srcWB = SpreadsheetApp.getActiveSpreadsheet();
  
  var srcSH = srcWB.getSheetByName('D01');
 
  for( var i =2; i<=shTotalCnt;i++){
    var tmpN = '';
    if( i<=9){
      var tmpN ='0'+i;
    }else{
      var tmpN = i;
    }
    
    var trgShName = 'D' + tmpN;
    
    var chkSh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(trgShName);
    if( chkSh!== null){
      srcWB.deleteSheet(chkSh);
    }
    
    var shName = srcSH.getName();
    
    if(rebuild){
      var trgSh = srcSH.copyTo(srcWB);
      trgSh.setName(trgShName);
//      trgSh.getRange(shNameRngAdr).setValue(trgShName);
//      trgSh.hideSheet();
    }
    
  }
  
}