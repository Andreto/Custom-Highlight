console.log("running content.js")

chrome.storage.sync.get(['highlightColor', 'highlightOnOff', 'highlightTextColor'], function(result) {
  console.log('highlightColor currently is ' + result.highlightColor);
  console.log('highlightTextColor currently is ' + result.highlightTextColor);
  if (result.highlightOnOff) {
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    element.innerHTML =
    '::selection {background: ' + result.highlightColor + '; color: ' + result.highlightTextColor + ';}' +
    '::-moz-selection {background: ' + result.highlightColor + '; color: ' + result.highlightTextColor + ';}';
    document.head.appendChild(element);
  }
});