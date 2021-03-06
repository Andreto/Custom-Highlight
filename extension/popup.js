// --- Variable declaration --- //

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

var editHistory;

// --- Event Listeners --- //

document.addEventListener('DOMContentLoaded', function() {
  for (const anchor of document.getElementsByTagName('a')) {
    anchor.onclick = () => {
      chrome.tabs.create({active: true, url: anchor.href});
    };
  };
});

document.addEventListener("keydown", event => {
  if (event.key == 'z' && event.ctrlKey) {
    var edit = editHistory;
    if (edit.code == 0) {
      BGpickr.setColor(edit.val);
    }
    if (edit.code == 1) {
      TXTpickr.setColor(edit.val);
    }
  }
});

highlightOnOff.addEventListener("change", function() {
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {});
});

dynamicDarkColor.addEventListener("change", function() {
  chrome.storage.sync.set({highlightDynamicDarkColor: dynamicDarkColor.checked}, function() {});
});

aggressiveOverwrite.addEventListener("change", function() {
  chrome.storage.sync.set({highlightAggressiveOverwrite: aggressiveOverwrite.checked}, function() {});
});

exchangeButton.addEventListener("click", function() {
  exchangeColors();
});

highlightAutoTextColor.addEventListener("change", function() {
  console.log("set", highlightAutoTextColor.checked);
  chrome.storage.sync.set({highlightAutoTextColor: highlightAutoTextColor.checked}, function() {
    autoTextColorSet();
  });
});

// --- Page functions --- //

// Flip BG and TXT colors
function exchangeColors() {
  var bgColor = BGpickr.getColor().toHEXA().toString();
  var txtColor = TXTpickr.getColor().toHEXA().toString();
  BGpickr.setColor(txtColor);
  TXTpickr.setColor(bgColor);
}

function hexToRgb(hex) {
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {return r + r + g + g + b + b;});
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {r: parseInt(result[1], 16),g: parseInt(result[2], 16),b: parseInt(result[3], 16)} : null;
}
function componentToHex(c) {var hex = c.toString(16);return hex.length == 1 ? "0" + hex : hex;}
function rgbToHex(r, g, b) {return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);}


function autoTextColorSet() {
  chrome.storage.sync.get(['highlightColor', 'highlightAutoTextColor', 'highlightTextColor'], function(result) {
    if (result.highlightAutoTextColor) {
      var rgb = hexToRgb(result.highlightColor.substring(0, 7));
      var inverseColor = rgbToHex(255-rgb.r, 255-rgb.g, 255-rgb.b);
      chrome.storage.sync.set({highlightTextColor: inverseColor}, function() {
        TXTpickr.setColor(inverseColor);
      });
    };
    console.log(result.highlightAutoTextColor);
    highlightAutoTextColor.checked = result.highlightAutoTextColor;
  });
}

//Set page colors //Uses gh -> andreto/css-change
function changePopupTheme(){
  root.classList.add("dark-ui");
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

function updateCurrentTab() {
  chrome.tabs.query({}, function(result) {
    for (let i = 0; i < result.length; i++) {
      if (result[i].url){
        chrome.scripting.insertCSS({
          target: {tabId: result[i].id}, 
          css: '::selection { --cws-custom-highlight-bg:' + highlightInput.value + ';--cws-custom-highlight-txt:' + highlightTextInput.value + ';}'
        });
      }
    }
  });
}

// --- Pickr, color picker --- //
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
  editHistory = ({"code": 0, "val": highlightInput.value});
  chrome.storage.sync.set({highlightColor: color.toHEXA().toString()}, function() {});
  updateUiColors(highlightInput, color);
  autoTextColorSet();
  document.getElementsByTagName("h1")[0].style.background = color.toHEXA().toString();
  updateCurrentTab()
});
TXTpickr.on('save', (color, instance) => {
  editHistory = ({"code": 1, "val": highlightTextInput.value});
  updateUiColors(highlightTextInput, color);
  chrome.storage.sync.get(['highlightTextColor'], function(result) { 
    if (result.highlightTextColor !== color.toHEXA().toString()){
      chrome.storage.sync.set({highlightTextColor: color.toHEXA().toString(), highlightAutoTextColor: false}, function() {});
      highlightAutoTextColor.checked = false;
      console.log("setting it to false", result.highlightTextColor);
    }
  });
  document.getElementsByTagName("h1")[0].style.color = color.toHEXA().toString();
  updateCurrentTab()
});


// --- Startup --- //
chrome.storage.sync.get(['highlightColor', 'highlightTextColor', 'highlightOnOff', 'darkreader', 'highlightDynamicDarkColor', 'highlightAggressiveOverwrite'], function(result) {
  if(result.darkreader){changePopupTheme();}
  highlightOnOff.checked = result.highlightOnOff;
  dynamicDarkColor.checked = result.highlightDynamicDarkColor;
  aggressiveOverwrite.checked = result.highlightAggressiveOverwrite;
  highlightInput.value = result.highlightColor
  highlightTextInput.value = result.highlightTextColor;
  BGpickr.setColor(result.highlightColor);
  TXTpickr.setColor(result.highlightTextColor);
  document.getElementsByTagName("h1")[0].style.color = result.highlightTextColor;
  document.getElementsByTagName("h1")[0].style.background = result.highlightColor;
});

autoTextColorSet();