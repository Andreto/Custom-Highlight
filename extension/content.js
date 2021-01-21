chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {
  //console.log('highlightColor currently is ' + result.highlightColor);
  //console.log('highlightTextColor currently is ' + result.highlightTextColor);
  console.log('highlightDynamicDarkColor currently is ' + result.highlightDynamicDarkColor);
  console.log('highlightAggressiveOverwrite currently is ' + result.highlightAggressiveOverwrite);
  if (result.highlightOnOff) {
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
    document.head.appendChild(element);
  }


  //Darkreader comp
  if (document.querySelectorAll("style.darkreader").length == 0){ //Set darkreader variable
    var darkr = false;
  }else{
    var darkr = true;
  }
  chrome.storage.sync.set({darkreader: darkr}, function() {});

  if (darkr) {
    for (i = 0; i < document.querySelectorAll("style.darkreader").length; i++) {
      if (document.querySelectorAll("style.darkreader")[i].innerHTML.includes("::selection")) {
        document.querySelectorAll("style.darkreader")[i].innerHTML = document.querySelectorAll("style.darkreader")[i].innerHTML.replace("::selection", "#CustomHighlight-DarkreaderSelectionReplacer");
      }
    }
    console.log(!result.highlightDynamicDarkColor);
    if (!result.highlightDynamicDarkColor) {
      window.onload = function() {
        console.log("running window onload");
        var sheets = document.querySelectorAll(".darkreader--sync");
        for (let {sheet} of sheets) {
          for (let rule of sheet.cssRules) {
            if (rule.selectorText === "::selection") {
              rule.style = "";
            }
          }
        }
      };
    }
  }
});
