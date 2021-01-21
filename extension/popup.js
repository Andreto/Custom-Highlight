var highlightInput = document.getElementById('highlight-input');
var highlightTextInput = document.getElementById('highlight-text-input');
var highlightOnOff = document.getElementById('highlight-on-off');
var highlightAutoTextColor = document.getElementById('highlight-auto-text')
var dynamicDarkColor = document.getElementById('dynamic-dark-color')
var aggressiveOverwrite = document.getElementById('aggressive-overwrite')

var standardColor = "#FFA500"
var standardTextColor = "#005AFF"


//Document Changes
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

highlightOnOff.onchange = function() {
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {});
}

function autoTextColorSet() {
  chrome.storage.sync.get(['highlightColor', 'highlightAutoTextColor', 'highlightTextColor'], function(result) {
    if (result.highlightAutoTextColor) {
      var rgb = hexToRgb(result.highlightColor.substring(0, 7));
      highlightTextInput.value = (rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b)).toUpperCase();
      if (result.highlightTextColor !== highlightTextInput.value){
        chrome.storage.sync.set({highlightTextColor: highlightTextInput.value}, function() {});
      }
      TXTpickr.setColor(rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b));
    };
    console.log("Auto-color: " + result.highlightAutoTextColor);
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
  [[".color-input", "hr"], "border-color", "#555"],
  [[".box-label", ".setting-label", ".info-link-small"], "color", "#aaa"],
  [".pcr-button", "border-color", "#292a2d !important"],
  [".pcr-app", "background-color", "#2f3033"],
];

autoTextColorSet();
highlightAutoTextColor.onchange = function() {
  chrome.storage.sync.set({highlightAutoTextColor: highlightAutoTextColor.checked}, function() {});
  autoTextColorSet();
}

dynamicDarkColor.onchange = function() {
  chrome.storage.sync.set({highlightDynamicDarkColor: dynamicDarkColor.checked}, function() {});
}
aggressiveOverwrite.onchange = function() {
  chrome.storage.sync.set({highlightAggressiveOverwrite: aggressiveOverwrite.checked}, function() {});
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
    console.log('save', color, instance, 'color');
    chrome.storage.sync.set({highlightColor: color.toHEXA().toString()}, function() {});
    highlightInput.value = color.toHEXA().toString();
    autoTextColorSet();
    document.getElementsByTagName("h1")[0].style.background = color.toHEXA().toString();
});
TXTpickr.on('save', (color, instance) => {
    console.log('save', color, instance, 'txt');
    chrome.storage.sync.get(['highlightTextColor'], function(result) { if (result.highlightTextColor !== color.toHEXA().toString()){
      chrome.storage.sync.set({highlightTextColor: color.toHEXA().toString(), highlightAutoTextColor: false}, function() {});
      highlightTextInput.value = color.toHEXA().toString();
      highlightAutoTextColor.checked = false;
    }});
    document.getElementsByTagName("h1")[0].style.color = color.toHEXA().toString();
});


//Update Values
chrome.storage.sync.get(['highlightColor', 'highlightTextColor', 'highlightOnOff', 'darkreader', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {
  if(result.darkreader){changePupopTheme(colorChangeData);}
  highlightOnOff.checked = result.highlightOnOff;
  dynamicDarkColor.checked = result.highlightDynamicDarkColor;
  aggressiveOverwrite.checked = result.highlightAggressiveOverwrite;
  highlightInput.value = result.highlightColor
  highlightTextInput.value = result.highlightTextColor;
  console.log(result.highlightColor + ", " + result.highlightColor);
  BGpickr.setColor(result.highlightColor);
  TXTpickr.setColor(result.highlightTextColor);
  document.getElementsByTagName("h1")[0].style.color = result.highlightTextColor;
  document.getElementsByTagName("h1")[0].style.background = result.highlightColor;
});
