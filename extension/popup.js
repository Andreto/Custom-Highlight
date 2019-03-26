let highlightInput = document.getElementById('highlight-input');
let highlightTextInput = document.getElementById('highlight-text-input');
let highlightOnOff = document.getElementById('highlight-on-off');

function setInputOnchange(inputElem, colorElem, standardColor, storageKey){
  inputElem.onchange = function() {
    var color = inputElem.value.replace("#", "");
    if (color.length == 6 || color.length == 3){
      color = "#" + color;
    }else{
      color = standardColor;
    }
    document.getElementById(colorElem).style.background = color;
    inputElem.value = color;
    var storageObj = {};
    storageObj[storageKey] = color;
    chrome.storage.sync.set(storageObj, function() {
      console.log('highlightColor is set to ' + color);
    });
  };
};

setInputOnchange(highlightInput, 'highlight-color', '#ff80e4', 'highlightColor');
setInputOnchange(highlightTextInput, 'highlight-text-color', '#ffffff', 'highlightTextColor');

highlightOnOff.onchange = function() {
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {
    console.log('highlightOnOff is now ' + highlightOnOff.checked);
  });
}

function updatePopupValues(inputElem, colorElem, standardColor, storageKey, resultObj){
  if(resultObj == undefined){
    document.getElementById(colorElem).style.background = standardColor;
    inputElem.value = standardColor;
    var storageObj = {};
    storageObj[storageKey] = standardColor;
    chrome.storage.sync.set(storageObj, function() {
      console.log('highlightColor is set to ' + standardColor);
    });
  }else{
    document.getElementById(colorElem).style.background = resultObj;
    inputElem.value = resultObj;
  }
};

chrome.storage.sync.get(['highlightColor', 'highlightTextColor', 'highlightOnOff'], function(result) {
  updatePopupValues(highlightInput, 'highlight-color', '#ff80e4', 'highlightColor', result.highlightColor);
  updatePopupValues(highlightTextInput, 'highlight-text-color', '#ffffff', 'highlightTextColor', result.highlightTextColor);
  highlightOnOff.checked = result.highlightOnOff;
 });
