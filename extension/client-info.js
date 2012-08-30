var CLIENT_INFO_KEY = 'client-info';

function hasClientInfo(callback) {
  chrome.storage.local.get(CLIENT_INFO_KEY, function(storageData) {
    callback(storageData && CLIENT_INFO_KEY in storageData);
  });
}

function getClientInfo(callback) {
  chrome.storage.local.get(CLIENT_INFO_KEY, function(storageData) {
    if (storageData && CLIENT_INFO_KEY in storageData) {
      callback(storageData[CLIENT_INFO_KEY]);
      return;
    }

    var clientInfo = {
      id: Math.round(Math.random() * Date.now() * 1000).toString(36),
      name: 'Profile ' + Math.round(Math.random() * Date.now()).toString(36)
    };
    storageData[CLIENT_INFO_KEY] = clientInfo;
    chrome.storage.local.set(storageData, function() {
      callback(clientInfo);
    });
  });
}

function setClientInfo(clientInfo, callback) {
  var storageData = {};
  storageData[CLIENT_INFO_KEY] = clientInfo;
  chrome.storage.local.set(storageData, callback);
}
