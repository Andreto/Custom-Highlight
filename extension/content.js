chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {

  if (result.highlightOnOff) {

    //Create style inject object
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    var important = '';
    if (result.highlightAggressiveOverwrite) {
      important = '!important'
    }
    element.innerHTML =
      ':root { --cws-custom-highlight-bg:' + result.highlightColor + ';--cws-custom-highlight-txt:' + result.highlightTextColor + ';}' +
      '::selection {background: var(--cws-custom-highlight-bg,' + result.highlightColor + ') '+important+'; color: var(--cws-custom-highlight-txt,' + result.highlightTextColor + ') '+important+';}' +
      '.kix-selection-overlay {background: ' + result.highlightColor + ';color:' + result.highlightTextColor + ';border-top-color:' + result.highlightColor + ';border-bottom-color:' + result.highlightColor + ';}';
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
      //Remove early, easy to reach injects
      for (i = 0; i < document.querySelectorAll("style.darkreader").length; i++) {
        if (document.querySelectorAll("style.darkreader")[i].innerHTML.includes("::selection")) {
          document.querySelectorAll("style.darkreader")[i].innerHTML = document.querySelectorAll("style.darkreader")[i].innerHTML.replace("::selection", "#CustomHighlight-DarkreaderSelectionReplacer");
        }
      }
      var darkreaderRemove;
      if (result.highlightDynamicDarkColor) {
        darkreaderRemove = ".darkreader--user-agent";
      } else {
        darkreaderRemove = ".darkreader";
      }
      //Removes late injects
      window.addEventListener('load', (event) => {
        var sheets = document.querySelectorAll(darkreaderRemove);
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
    }
  }
});
