var highlightInput = document.getElementById('highlight-input');
var highlightTextInput = document.getElementById('highlight-text-input');
var highlightOnOff = document.getElementById('highlight-on-off');
var highlightAutoTextColor = document.getElementById('highlight-auto-text');
var dynamicDarkColor = document.getElementById('dynamic-dark-color');
var aggressiveOverwrite = document.getElementById('aggressive-overwrite');
var exchangeButton = document.getElementById('exchange-button');
var root = document.documentElement;

var standardColor = "#FFA500"
var standardTextColor = "#005AFF"

var editHistory = [];

//Document Changes
document.addEventListener('DOMContentLoaded', function () {
  for (const anchor of document.getElementsByTagName('a')) {
    anchor.onclick = () => {
      chrome.tabs.create({active: true, url: anchor.href});
    };
  };
});

document.addEventListener("keydown", event => {
  if (event.key == 'z' && event.ctrlKey) {
    var edit = editHistory[editHistory.length-1];
    if (edit.code == 0) {
      BGpickr.setColor(edit.val);
    }
    if (edit.code == 1) {
      TXTpickr.setColor(edit.val);
    }
  }
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
function changePopupTheme(){
  root.classList.add("dark-ui");
}

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

function updateUiColors(elem, color) {
  if (elem == highlightInput) {
    var cssProperty = "--highlight-bck-color";
    var txtColor = TXTpickr.getColor();
    var bgColor = color;
  } else if (elem == highlightTextInput) {
    var cssProperty = "--highlight-txt-color";
    var txtColor = color;
    var bgColor = BGpickr.getColor();
  }

  elem.value = color.toHEXA().toString();
  elem.style.borderColor = color.toHEXA().toString().substring(0, 7);
  if (color.v > 87 && color.s < 13) {
    elem.style.borderColor = "#ddd";
    elem.classList.add("white");
    root.style.setProperty(cssProperty, "#ddd");
  } else {
    elem.classList.remove("white");
    root.style.setProperty(cssProperty, color.toHEXA().toString().substring(0, 7));
  }

  if (bgColor.v < 60 || bgColor.s > 30) {
    root.style.setProperty("--ui-accent-color", bgColor.toHEXA().toString().substring(0, 7));
  } else {
    if (txtColor.v < 60 || txtColor.s > 30) {
      root.style.setProperty("--ui-accent-color", txtColor.toHEXA().toString().substring(0, 7));
    }
  }
}

function injectCurrentTabs() {
  var cssString ='::selection {background:' + TXTpickr.getColor().toHEXA().toString() + ' !important; color:' + TXTpickr.getColor().toHEXA().toString() + ' !important;}';
  chrome.scripting.insertCSS(cssString);
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
  editHistory.push({"code": 0, "val": highlightInput.value});
  console.log('save', color, instance, 'color');
  chrome.storage.sync.set({highlightColor: color.toHEXA().toString()}, function() {});
  updateUiColors(highlightInput, color);
  autoTextColorSet();
  document.getElementsByTagName("h1")[0].style.background = color.toHEXA().toString();
  updateTabs()
});
TXTpickr.on('save', (color, instance) => {
  editHistory.push({"code": 1, "val": highlightTextInput.value});
  console.log('save', color, instance, 'txt');
  updateUiColors(highlightTextInput, color);
  chrome.storage.sync.get(['highlightTextColor'], function(result) { if (result.highlightTextColor !== color.toHEXA().toString()){
    chrome.storage.sync.set({highlightTextColor: color.toHEXA().toString(), highlightAutoTextColor: false}, function() {});
    highlightAutoTextColor.checked = false;
  }});
  document.getElementsByTagName("h1")[0].style.color = color.toHEXA().toString();
  updateTabs()
});

function exchangeColors() {
  var bgColor = BGpickr.getColor().toHEXA().toString();
  var txtColor = TXTpickr.getColor().toHEXA().toString();
  BGpickr.setColor(txtColor);
  TXTpickr.setColor(bgColor);
}
exchangeButton.onclick = function() {
  exchangeColors();
}

//Update Values
chrome.storage.sync.get(['highlightColor', 'highlightTextColor', 'highlightOnOff', 'darkreader', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {
  if(result.darkreader){changePopupTheme();}
  highlightOnOff.checked = result.highlightOnOff;
  dynamicDarkColor.checked = result.highlightDynamicDarkColor;
  aggressiveOverwrite.checked = result.highlightAggressiveOverwrite;
  highlightInput.value = result.highlightColor
  highlightTextInput.value = result.highlightTextColor;
  console.log(result.highlightColor + ", " + result.highlightTextColor);
  BGpickr.setColor(result.highlightColor);
  TXTpickr.setColor(result.highlightTextColor);
  document.getElementsByTagName("h1")[0].style.color = result.highlightTextColor;
  document.getElementsByTagName("h1")[0].style.background = result.highlightColor;
});

function updateTabs() {
  chrome.tabs.query({}, function(result) {
    for (let i = 0; i < result.length; i++) {
      console.log(result[i].id);
      chrome.scripting.removeCSS({
        target: {tabId: result[i].id}, 
        css: '::selection {background: #434343 !important;color: #4153FF !important;}'
      }, function() {
        chrome.scripting.insertCSS({
          target: {tabId: result[i].id}, 
          css: '::selection {background:' + highlightInput.value + ' !important; color:' + highlightTextInput.value + ' !important;}' + '.kix-selection-overlay {background: ' + highlightInput.value + ';color:' + highlightTextInput.value + ';border-top-color:' + highlightInput.value + ';border-bottom-color:' + highlightInput.value + ';}'
        });
      });
    }
  });
}
