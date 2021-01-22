chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {

  if (result.highlightOnOff) {

    //Create style inject object
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    if (result.highlightAggressiveOverwrite) {
      element.innerHTML =
      '::selection {background:' + result.highlightColor + ' !important; color:' + result.highlightTextColor + ' !important;}' +
      '.kix-selection-overlay {background: ' + result.highlightColor + ';color:' + result.highlightTextColor + ';border-top-color:' + result.highlightColor + ';border-bottom-color:' + result.highlightColor + ';}';
    } else {
      element.innerHTML =
      '::selection {background:' + result.highlightColor + '; color:' + result.highlightTextColor + ';}' +
      '.kix-selection-overlay {background: ' + result.highlightColor + ';color:' + result.highlightTextColor + ';border-top-color:' + result.highlightColor + ';border-bottom-color:' + result.highlightColor + ';}';
    }
    //Append style element
    document.head.appendChild(element);


    //Check for dark-reader style injects
    if (document.querySelectorAll("style.darkreader").length == 0){ //Set darkreader variable
      var darkr = false;
    }else{
      var darkr = true;
    }
    chrome.storage.sync.set({darkreader: darkr}, function() {});

    //Overwrite dark-reader
    if (darkr) {
      if (!result.highlightDynamicDarkColor) {
        //Removes late injects
        window.addEventListener('load', (event) => {
          var sheets = document.querySelectorAll(".darkreader");
          for (let {sheet} of sheets) {
            try {
              for (let rule of sheet.cssRules) {
                if (rule.selectorText.includes("::selection")) {
                  rule.selectorText = rule.selectorText.replace("::selection", "#CustomHighlight-DarkreaderSelectionReplacer");
                }
              }
            } catch (error) {
            }
          }
        });
      } else {
        for (i = 0; i < document.querySelectorAll("style.darkreader").length; i++) {
          if (document.querySelectorAll("style.darkreader")[i].innerHTML.includes("::selection")) {
            document.querySelectorAll("style.darkreader")[i].innerHTML = document.querySelectorAll("style.darkreader")[i].innerHTML.replace("::selection", "#CustomHighlight-DarkreaderSelectionReplacer");
          }
        }
      }
    }
  }
});
