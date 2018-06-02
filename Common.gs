function getGoogleSheetDateNumber(){
 var dateN = new Date().getTime()/86400000 + 25569.3333380093;
 return dateN;
}

function convertToGoogleSheetNumber(n){
  var dateN = n/86400000 + 25569.3333380093;
  return dateN;
}


function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function getAddress(e){
  var rng = e.range;
  var address = range.getA1Notation(); 
  return address;
}


function getSheetUrl() {
  var SS = SpreadsheetApp.getActiveSpreadsheet();
  var ss = SS.getActiveSheet();
  var url = '';
  url += SS.getUrl();
  url += '#gid=';
  url += ss.getSheetId(); 
  return url;
}

function columnToLetter(column)
{
  var temp, letter = '';
  while (column > 0)
  {
    temp = (column - 1) % 26;
    letter = String.fromCharCode(temp + 65) + letter;
    column = (column - temp - 1) / 26;
  }
  return letter;
}

function letterToColumn(letter)
{
  var column = 0, length = letter.length;
  for (var i = 0; i < length; i++)
  {
    column += (letter.charCodeAt(i) - 64) * Math.pow(26, length - i - 1);
  }
  return column;
}

function getKeyValuesFromRange(oriRange){
  var oriKeyValues = oriRange.getValues();
  
  var keyValues = {};
  for(var i=0 ; i<oriKeyValues.length ; i++){
     var key = oriKeyValues[i][0];
     if(key!== null && key.toString().trim() !== ''){
       keyValues[key]= oriKeyValues[i][1];
//       idx=idx+1;
     }
                     
  } 
  return keyValues;
}

