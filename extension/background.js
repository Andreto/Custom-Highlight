// Check whether new version is installed
chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    chrome.storage.sync.get('highlightColor', function(result) {
      if (result.highlightColor == undefined) {
        console.log("Setting up first-time storage values.");
        chrome.storage.sync.set(
        {
          highlightColor: "#FFA500",
          highlightTextColor: "#005AFF",
          highlightAutoTextColor: true,
          highlightOnOff: true,
          darkreader: false,
          highlightDynamicDarkColor: true,
          highlightAggressiveOverwrite: false
        },
        function() {});
      }
    });
  }
});

chrome.runtime.setUninstallURL("https://andreto.github.io/Custom-Highlight/uninstall/");
