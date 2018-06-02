function importCSVFromWeb(csvUrl,sheet, rng1stAddress) {
  
  // Provide the full URL of the CSV file.
  var fetchSuccess = false;
//  var csvfetch = UrlFetchApp.fetch(csvUrl);
//  if(csvfetch !== null){
//    var csvContent = csvfetch.getContentText();
    var csvContent = urlFetchWihtoutError(csvUrl)
    if(csvContent !== null){
      var csvData = Utilities.parseCsv(csvContent);
      if(csvData !== null && csvData.length >= 1 && csvData[0].length >= 1 ){
        var trgRng = sheet.getRange(rng1stAddress).offset(0, 0, csvData.length, csvData[0].length);
        trgRng.setValues(csvData);
//        SpreadsheetApp.flush();
        fetchSuccess =  true;
      }
      
    }
//  }
  
  return fetchSuccess;
  
}


function urlFetchWihtoutError(url) {
  const NB_RETRY = 3;
  var nbSecPause = 1;
  var nbErr = 0;
  while (nbErr < NB_RETRY) {
    try {
//      if (nbErr > 0) SpreadsheetApp.getActiveSpreadsheet().toast("Here we go again.");
      var res = UrlFetchApp.fetch(url).getContentText();
      return res;
    }
    catch (error) {
      nbErr = nbErr + 1;
      Utilities.sleep(nbSecPause * 1000)
      nbSecPause += 0.5;
    }
  }
}