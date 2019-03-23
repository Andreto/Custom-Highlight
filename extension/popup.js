let highlightInput = document.getElementById('highlight-input');
let highlightOnOff = document.getElementById('highlight-on-off');

highlightInput.onchange = function() {
  var color = highlightInput.value.replace("#", "");
  if (color.length == 6 || color.length == 3){
    color = "#" + color;
  }else{
    color = "#ff1c6b"
  }
  document.getElementById('highlight-color').style.background = color;
  highlightInput.value = color;
  chrome.storage.sync.set({highlightColor: color}, function() {
    console.log('highlightColor is set to ' + color);
  });
 };

 highlightOnOff.onchange = function() {
   chrome.storage.sync.set({highlightOnOff: highlightOnOff.checked}, function() {
     console.log('highlightOnOff is now ' + highlightOnOff.checked);
   });
 }

chrome.storage.sync.get(['highlightColor', 'highlightOnOff'], function(result) {
   if(result.highlightColor == undefined){
     chrome.storage.sync.set({highlightColor: '#ff1c6b'}, function() {
       console.log('highlightColor is set to ' + '#ff1c6b');
       document.getElementById('highlight-color').style.background = '#ff1c6b';
       highlightInput.value = '#ff1c6b';
     });
   }else{
     document.getElementById('highlight-color').style.background = result.highlightColor;
     highlightInput.value = result.highlightColor;
   }
   highlightOnOff.checked = result.highlightOnOff;
 });
