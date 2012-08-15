var storage = chrome.storage.sync;

var CLIPBOARD_DATA_KEY = 'clipboard-data';

chrome.browserAction.onClicked.addListener(function() {
  var bufferNode = document.getElementById('buffer');
  bufferNode.value = '';
  bufferNode.focus();
  bufferNode.selectionStart = bufferNode.selectionEnd = 0;
  if (!document.execCommand('paste')) {
    // TODO(mihaip): error handling
    alert('Couldn\'t paste into buffer');
    return;
  }
  var clipboardData = bufferNode.value + '1';
  var data = {};
  data[CLIPBOARD_DATA_KEY] = clipboardData;
  storage.set(data);
  // TODO(mihaip): check for rate limiting.
});

chrome.storage.onChanged.addListener(function(changes, storageNamespace) {
  if (storageNamespace != 'sync') {
    return;
  }

  if (!CLIPBOARD_DATA_KEY in changes) {
    return;
  }

  var clipboardData = changes[CLIPBOARD_DATA_KEY].newValue;

  var notification = new Notification('Clipboard synced', {
    body: clipboardData
  });
  notification.onclick = function() {
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
    notification.close();
  }
});