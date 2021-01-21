function overwriteDR(){
  console.log("running window onload");
  var sheets = document.querySelectorAll(".darkreader--sync");
  for (let {sheet} of sheets) {
    for (let rule of sheet.cssRules) {
      if (rule.selectorText === "::selection") {
        rule.style = "";
      }
    }
  }  
}
