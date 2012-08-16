var CLIPBOARD_DATA_KEY = 'clipboard-data';

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

    var clipboardDataSnippet = clipboardData;
    if (clipboardDataSnippet.length > 20) {
      clipboardDataSnippet = clipboardDataSnippet.substring(0, 20) + '…';
    }

    // We use the legacy notifications API since it supports icon URLs. The
    // new one doesn't (as implemented in WebKit).
    var notification = webkitNotifications.createNotification(
        chrome.extension.getURL('icon32.png'),
        'Clipboard pushed from ' + sourceClientInfo.name,
        'Click to copy "' + clipboardDataSnippet + '"');
    notification.show();
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
  return bufferNode.value;
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
