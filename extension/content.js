chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor'], function(result) {
  //console.log('highlightColor currently is ' + result.highlightColor);
  //console.log('highlightTextColor currently is ' + result.highlightTextColor);
  if (result.highlightOnOff) {
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    element.innerHTML =
    '::selection {background:' + result.highlightColor + '; color:' + result.highlightTextColor + ';}'
    document.head.appendChild(element);
  }
});


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
  window.onload = function() {
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
