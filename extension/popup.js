var highlightInput = document.getElementById('highlight-input');
var highlightTextInput = document.getElementById('highlight-text-input');
var highlightOnOff = document.getElementById('highlight-on-off');
var highlightAutoTextColor = document.getElementById('highlight-auto-text')
var standardColor = "#ffa500"
var standardTextColor = "#ffffff"

document.addEventListener('DOMContentLoaded', function () {
  for (const anchor of document.getElementsByTagName('a')) {
    anchor.onclick = () => {
      chrome.tabs.create({active: true, url: anchor.href});
    };
  };
});

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

highlightOnOff.onchange = function() {
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {});
}

function updatePopupValues(inputElem, storageKey, resultObj){
  if(resultObj == undefined){
    document.getElementById(colorElem).style.background = standardColor;
    inputElem.value = standardColor;
    var storageObj = {};
    storageObj[storageKey] = standardColor;
    chrome.storage.sync.set(storageObj, function() {});
  }else{
    inputElem.value = resultObj;
  }
};

function autoTextColorSet() {
  chrome.storage.sync.get(['highlightColor', 'highlightAutoTextColor', 'highlightTextColor'], function(result) {
    if (result.highlightAutoTextColor) {
      var rgb = hexToRgb(result.highlightColor.substring(0, 7));
      TXTpickr.setColor(rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b));
      highlightTextInput.value = (rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b))
      if (result.highlightTextColor !== highlightTextInput.value){
        chrome.storage.sync.set({highlightTextColor: highlightTextInput.value}, function() {});
      }
    };
    highlightAutoTextColor.checked = result.highlightAutoTextColor;
  });
}

//Set page colors //Uses gh -> andreto/css-change
function changePupopTheme(){
  for (i=0; i < colorChangeData.length; i++){
    var elements = document.querySelectorAll(colorChangeData[i][0]);
    for (var ii = 0; ii < elements.length; ii++) {
    	elements[ii].style = (colorChangeData[i][1] + ": " + colorChangeData[i][2] + ";");
    }
  }
}
var colorChangeData = [
  [["body", ".pcr-result"], "background-color", "#202124"],
  [[".box-label", ".color-input", ".color-box", ".style-check-container", ".fillet-100"], "background-color", "#292a2d"],
  [".pcr-button", "border-color", "#292a2d !important"],
  [".pcr-app", "background-color", "#2f3033"],
];

autoTextColorSet();
highlightAutoTextColor.onchange = function() {
  chrome.storage.sync.set({highlightAutoTextColor: highlightAutoTextColor.checked}, function() {});
  autoTextColorSet();
}


// Pickr - color picker
var pickrComponents = {
    preview: true,
    opacity: true,
    hue: true,
    interaction: {
        hex: false,
        rgba: false,
        hsla: false,
        hsva: false,
        cmyk: false,
        input: true,
        clear: false,
        save: true
    }
}

const BGpickr = Pickr.create({
    el: '.color-picker-bg',
    theme: 'nano',
    default: '#f18458',
    defaultRepresentation: 'HEX',
    components: pickrComponents
});

const TXTpickr = Pickr.create({
    el: '.color-picker-txt',
    theme: 'nano',
    default: '#ffffff',
    defaultRepresentation: 'HEX',
    components: pickrComponents
});

BGpickr.on('save', (color, instance) => {
    console.log('save', color, instance);
    chrome.storage.sync.set({highlightColor: color.toHEXA().toString()}, function() {});
    highlightInput.value = color.toHEXA().toString();
    autoTextColorSet();
    document.getElementsByTagName("h1")[0].style.background = color.toHEXA().toString();
});
TXTpickr.on('save', (color, instance) => {
    console.log('save', color, instance);
    chrome.storage.sync.set({highlightTextColor: color.toHEXA().toString(), highlightAutoTextColor: false}, function() {});
    highlightTextInput.value = color.toHEXA().toString();
    highlightAutoTextColor.checked = false;
    document.getElementsByTagName("h1")[0].style.color = color.toHEXA().toString();
});


//Update Values
chrome.storage.sync.get(['highlightColor', 'highlightTextColor', 'highlightOnOff', 'darkreader'], function(result) {
  //updatePopupValues(highlightInput, 'highlight-color', '#ff80e4', 'highlightColor', result.highlightColor);
  //updatePopupValues(highlightTextInput, 'highlightTextColor', result.highlightTextColor);
  if(result.darkreader){changePupopTheme(colorChangeData);}
  highlightOnOff.checked = result.highlightOnOff;
  BGpickr.setColor(result.highlightColor);
  TXTpickr.setColor(result.highlightTextColor);
  document.getElementsByTagName("h1")[0].style.color = result.highlightTextColor;
  document.getElementsByTagName("h1")[0].style.background = result.highlightColor;
});
