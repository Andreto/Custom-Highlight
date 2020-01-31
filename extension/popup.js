let highlightInput = document.getElementById('highlight-input');
let highlightTextInput = document.getElementById('highlight-text-input');
let highlightOnOff = document.getElementById('highlight-on-off');
let highlightAutoTextColor = document.getElementById('highlight-auto-text')

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {return r + r + g + g + b + b;});
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)} : null;
}
function componentToHex(c) {var hex = c.toString(16);return hex.length == 1 ? "0" + hex : hex;}
function rgbToHex(r, g, b) {return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);}

function inputUpdate(inputElem, colorElem, standardColor, storageKey){
  var color = inputElem.value.replace("#", "");
  if (color.length == 6 || color.length == 3 || color.length == 8){
    color = "#" + color;
  }else{
    color = standardColor;
  }
  document.getElementById(colorElem).style.background = color;
  inputElem.value = color;
  var storageObj = {};
  storageObj[storageKey] = color;
  chrome.storage.sync.set(storageObj, function() {
    console.log(colorElem + 'is set to ' + color);
  });
};

highlightInput.onchange = function() {inputUpdate(highlightInput, 'highlight-color', '#ffa500', 'highlightColor');autoTextColorSet();};
highlightTextInput.onchange = function() {inputUpdate(highlightTextInput, 'highlight-text-color', '#ffffff', 'highlightTextColor');};

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

function autoTextColorSet() {
  chrome.storage.sync.get(['highlightColor', 'highlightAutoTextColor', 'highlightTextColor'], function(result) {
    if (result.highlightAutoTextColor) {
      var rgb = hexToRgb(result.highlightColor.substring(0, 7));
      highlightTextInput.value = (rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b))
      document.getElementById('highlight-text-color').style.background = highlightTextInput.value;
      if (result.highlightTextColor !== highlightTextInput.value){
        chrome.storage.sync.set({highlightTextColor: highlightTextInput.value}, function() {});
      }
    };
    highlightTextInput.disabled = result.highlightAutoTextColor;
    highlightAutoTextColor.checked = result.highlightAutoTextColor;
  });
}

autoTextColorSet();
highlightAutoTextColor.onchange = function() {
  chrome.storage.sync.set({highlightAutoTextColor: highlightAutoTextColor.checked}, function() {});
  autoTextColorSet();
}
