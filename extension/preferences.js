var PREFERENCES_KEY = 'preferences';

function getPreferences(callback) {
  chrome.storage.local.get(PREFERENCES_KEY, function(storageData) {
    if (storageData && PREFERENCES_KEY in storageData) {
      callback(storageData[PREFERENCES_KEY]);
      return;
    }

    callback({
      autoDismissTimeout: 60
    });
  });
}

function setPreferences(preferences, callback) {
  var storageData = {};
  storageData[PREFERENCES_KEY] = preferences;
  chrome.storage.local.set(storageData, callback);
}
