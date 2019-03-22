let highlightInput = document.getElementById('highlight-input');

highlightInput.onchange = function() {
  var color = highlightInput.value.replace("#", "");
  var regExp = new RegExp(/^0x[0-9A-F]{1,4}$/i);
  if (color.length == 6 || color.length == 3){
    color = "#" + color;
  }else{
    color = "#ff1c6b"
  }
  document.getElementById('highlight-color').style.background = color;
  highlightInput.value = color;
  console.log(color);
 };
