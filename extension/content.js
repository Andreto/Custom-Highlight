console.log("running content.js")

chrome.storage.sync.get(['highlightColor', 'highlightOnOff'], function(result) {
  console.log('highlightColor currently is ' + result.highlightColor);
  if (result.highlightOnOff) {
    var element = document.createElement('style');
    element.setAttribute('id','highlightColorStyleElem');
    element.innerHTML =
    '::selection {background: ' + result.highlightColor + '; color: #fff;}' +
    '::-moz-selection {background: ' + result.highlightColor + '; color: #fff;}';
    document.head.appendChild(element);
  }
});
