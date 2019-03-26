let highlightInput = document.getElementById('highlight-input');
let highlightTextInput = document.getElementById('highlight-text-input');
let highlightOnOff = document.getElementById('highlight-on-off');

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
        return r + r + g + g + b + b;
    });

    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function autoTextColorSet() {
  chrome.storage.sync.get(['highlightColor'], function(result) {
    var rgb = hexToRgb(result.highlightColor);
    if ((rgb.r + rgb.g + rgb.b)/3 > 128){
      console.log("ljus");
    }else{
      console.log("mörk");
    }
  });
}

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
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {});
}

function updatePopupValues(inputElem, colorElem, standardColor, storageKey, resultObj){
  if(resultObj == undefined){
    document.getElementById(colorElem).style.background = standardColor;
    inputElem.value = standardColor;
    var storageObj = {};
    storageObj[storageKey] = standardColor;
    chrome.storage.sync.set(storageObj, function() {});
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
