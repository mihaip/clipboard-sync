var CLIENT_INFO_KEY = 'client-info';
var CLIPBOARD_DATA_KEY = 'clipboard-data';

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

chrome.browserAction.onClicked.addListener(function() {
  var clipboardData = getClipboardData();
  getClientInfo(function(clientInfo) {
    var storageData = {};
    storageData[CLIPBOARD_DATA_KEY] = {
      clientInfo: clientInfo,
      value: clipboardData
    };
    chrome.storage.sync.set(storageData);
    // TODO(mihaip): check for rate limiting.
  });
});

chrome.storage.onChanged.addListener(function(changes, storageNamespace) {
  if (storageNamespace != 'sync') {
    return;
  }

  if (!CLIPBOARD_DATA_KEY in changes) {
    return;
  }

  var data = changes[CLIPBOARD_DATA_KEY].newValue;
  var sourceClientInfo = data.clientInfo;
  var clipboardData = data.value;

  getClientInfo(function(clientInfo) {
    if (clientInfo.id == sourceClientInfo.id) {
      return;
    }

    var notification = new Notification(
        'Clipboard synced from ' + sourceClientInfo.name, {
          body: clipboardData
        });
    notification.onclick = function() {
      setClipboardData(clipboardData);
      notification.close();
      // TODO(mihaip): delete the synced data once copied, which then removes
      // the notifications where it's still displayed.
    }
  });
});

function getClipboardData() {
  var bufferNode = document.getElementById('buffer');
  bufferNode.value = '';
  bufferNode.focus();
  bufferNode.selectionStart = bufferNode.selectionEnd = 0;
  if (!document.execCommand('paste')) {
    // TODO(mihaip): error handling
    alert('Couldn\'t paste into buffer');
    return;
  }
  return bufferNode.value + '1';
}

function setClipboardData(clipboardData) {
  var bufferNode = document.getElementById('buffer');
  bufferNode.value = clipboardData;
  bufferNode.focus();
  bufferNode.selectionStart = 0;
  bufferNode.selectionEnd = clipboardData.length;
  if (!document.execCommand('copy')) {
    // TODO(mihaip): error handling
    alert('Couldn\'t copy from buffer');
    return;
  }
}