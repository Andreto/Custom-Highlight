const highlightInput = document.getElementById('highlight-input');
const highlightTextInput = document.getElementById('highlight-text-input');
const highlightOnOff = document.getElementById('highlight-on-off');
const highlightAutoTextColor = document.getElementById('highlight-auto-text');
const dynamicDarkColor = document.getElementById('dynamic-dark-color');
const aggressiveOverwrite = document.getElementById('aggressive-overwrite');
const exchangeButton = document.getElementById('exchange-button');
const root = document.documentElement;
const previewHeading = document.querySelector('h1');

const standardColor = "#FFA500";
const standardTextColor = "#005AFF";

let previousColors;
let currentColors;
highlightAutoTextColor.disabled = true;

// --- Event Listeners --- //

document.addEventListener('DOMContentLoaded', function() {
  for (const anchor of document.getElementsByTagName('a')) {
    anchor.onclick = () => {
      chrome.tabs.create({active: true, url: anchor.href});
    };
  }
});

document.addEventListener("keydown", event => {
  if (event.key === 'z' && event.ctrlKey && previousColors) {
    commitColors(previousColors);
    event.preventDefault();
  }
});

highlightOnOff.addEventListener("change", function() {
  chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked});
});

dynamicDarkColor.addEventListener("change", function() {
  chrome.storage.sync.set({highlightDynamicDarkColor: dynamicDarkColor.checked});
});

aggressiveOverwrite.addEventListener("change", function() {
  chrome.storage.sync.set({highlightAggressiveOverwrite: aggressiveOverwrite.checked});
});

exchangeButton.addEventListener("click", function() {
  if (currentColors) {
    commitColors({
      highlightColor: currentColors.highlightTextColor,
      highlightTextColor: currentColors.highlightColor,
      highlightAutoTextColor: false
    });
  }
});

highlightAutoTextColor.addEventListener("change", function() {
  if (currentColors) {
    commitColors({
      ...currentColors,
      highlightAutoTextColor: highlightAutoTextColor.checked
    });
  }
});

// --- Page functions --- //

function normalizeHexColor(value, fallback) {
  if (typeof value !== "string") {
    return fallback;
  }

  const hex = value.trim().toUpperCase();
  return /^#(?:[0-9A-F]{3,4}|[0-9A-F]{6}|[0-9A-F]{8})$/.test(hex) ? hex : fallback;
}

function invertColor(hex) {
  const rgb = hex.slice(1, 7);
  return "#" + (0xFFFFFF - parseInt(rgb, 16)).toString(16).padStart(6, "0").toUpperCase();
}

function renderColors(settings) {
  // Commit programmatic colors without invoking either save handler.
  BGpickr.setColor(normalizeHexColor(settings.highlightColor, standardColor), true);
  BGpickr.applyColor(true);
  const background = BGpickr.getSelectedColor();
  const backgroundHex = background.toHEXA().toString();

  const textHex = settings.highlightAutoTextColor
    ? invertColor(backgroundHex)
    : normalizeHexColor(settings.highlightTextColor, standardTextColor);
  TXTpickr.setColor(textHex, true);
  TXTpickr.applyColor(true);
  const text = TXTpickr.getSelectedColor();

  const selectedTextHex = text.toHEXA().toString();
  updateColorInput(highlightInput, background, backgroundHex, "--highlight-bck-color");
  updateColorInput(highlightTextInput, text, selectedTextHex, "--highlight-txt-color");

  if (background.v < 60 || background.s > 30) {
    root.style.setProperty("--ui-accent-color", backgroundHex.slice(0, 7));
  } else if (text.v < 60 || text.s > 30) {
    root.style.setProperty("--ui-accent-color", selectedTextHex.slice(0, 7));
  }

  previewHeading.style.backgroundColor = backgroundHex;
  previewHeading.style.color = selectedTextHex;
  highlightAutoTextColor.checked = settings.highlightAutoTextColor;
  return {
    highlightColor: backgroundHex,
    highlightTextColor: selectedTextHex,
    highlightAutoTextColor: settings.highlightAutoTextColor
  };
}

function commitColors(settings) {
  const previous = currentColors;
  currentColors = renderColors(settings);
  if (currentColors.highlightColor === previous.highlightColor &&
      currentColors.highlightTextColor === previous.highlightTextColor &&
      currentColors.highlightAutoTextColor === previous.highlightAutoTextColor) {
    return;
  }

  previousColors = previous;
  chrome.storage.sync.set(currentColors);
  updateOpenTabs();
}

function updateColorInput(input, color, hex, cssProperty) {
  const isLight = color.v > 87 && color.s < 13;
  const borderColor = isLight ? "#ddd" : hex.slice(0, 7);
  input.value = hex;
  input.style.borderColor = borderColor;
  input.classList.toggle("white", isLight);
  root.style.setProperty(cssProperty, borderColor);
}

function updateOpenTabs() {
  chrome.tabs.query({}, tabs => {
    const {highlightColor, highlightTextColor} = currentColors;
    const css = `::selection {
      --cws-custom-highlight-bg: ${highlightColor};
      --cws-custom-highlight-txt: ${highlightTextColor};
    }`;
    for (const tab of tabs) {
      if (!tab.url) {
        continue;
      }
      chrome.scripting.insertCSS({target: {tabId: tab.id}, css}, () => {
        // Chrome blocks injection on restricted pages.
        void chrome.runtime.lastError;
      });
    }
  });
}

// --- Pickr, color picker --- //
const pickrComponents = {
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
};

const BGpickr = Pickr.create({
  el: '.color-picker-bg',
  theme: 'nano',
  default: standardColor,
  disabled: true,
  defaultRepresentation: 'HEX',
  components: pickrComponents
});

const TXTpickr = Pickr.create({
  el: '.color-picker-txt',
  theme: 'nano',
  default: standardTextColor,
  disabled: true,
  defaultRepresentation: 'HEX',
  components: pickrComponents
});

BGpickr.on('save', color => {
  commitColors({
    ...currentColors,
    highlightColor: color.toHEXA().toString()
  });
});

TXTpickr.on('save', color => {
  const textHex = color.toHEXA().toString();
  if (textHex !== currentColors.highlightTextColor) {
    commitColors({
      ...currentColors,
      highlightTextColor: textHex,
      highlightAutoTextColor: false
    });
  }
});

// --- Startup --- //
const backgroundReady = new Promise(resolve => BGpickr.on('init', resolve));
const textReady = new Promise(resolve => TXTpickr.on('init', resolve));

chrome.storage.sync.get({
  highlightColor: standardColor,
  highlightTextColor: standardTextColor,
  highlightOnOff: true,
  darkreader: false,
  highlightDynamicDarkColor: true,
  highlightAggressiveOverwrite: false,
  highlightAutoTextColor: true
}, async function(result) {
  root.classList.toggle("dark-ui", result.darkreader);
  highlightOnOff.checked = result.highlightOnOff;
  dynamicDarkColor.checked = result.highlightDynamicDarkColor;
  aggressiveOverwrite.checked = result.highlightAggressiveOverwrite;

  await Promise.all([backgroundReady, textReady]);
  currentColors = renderColors(result);

  if (result.highlightAutoTextColor &&
      currentColors.highlightTextColor !== normalizeHexColor(result.highlightTextColor, standardTextColor)) {
    chrome.storage.sync.set({highlightTextColor: currentColors.highlightTextColor});
    updateOpenTabs();
  }

  highlightAutoTextColor.disabled = false;
  BGpickr.enable();
  TXTpickr.enable();
});
