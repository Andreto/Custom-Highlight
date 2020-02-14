console.log("running content.js")

chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor'], function(result) {
  console.log('highlightColor currently is ' + result.highlightColor);
  console.log('highlightTextColor currently is ' + result.highlightTextColor);
  if (result.highlightOnOff) {
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    element.innerHTML =
    '::selection {background:' + result.highlightColor + '; color:' + result.highlightTextColor + ';}' +
    '::-moz-selection {background:' + result.highlightColor + '; color:' + result.highlightTextColor + ';}' +
    '.kix-selection-overlay {background: ' + result.highlightColor + ';color:' + result.highlightTextColor + ';border-top-color:' + result.highlightColor + ';border-bottom-color:' + result.highlightColor + ';}';
    document.head.appendChild(element);
  }
});
