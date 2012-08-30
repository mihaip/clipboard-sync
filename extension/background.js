var currentNotification;

var CLIPBOARD_DATA_KEY = 'clipboard-data';

chrome.browserAction.onClicked.addListener(function() {
  var clipboardData = getClipboardData();
  getClientInfo(function(clientInfo) {
    var storageData = {};
    storageData[CLIPBOARD_DATA_KEY] = {
      clientInfo: clientInfo,
      value: clipboardData,
      // We add the timestamp to the stored data to make sure that copying the
      // same thing as what was last copying still generates a change
      // notification that gets synced.
      timestamp: Date.now()
    };

    chrome.storage.sync.set(storageData, function() {
      // TODO(mihaip): always use chrome.runtime once Chrome 22 hits stable.
      var error = chrome.runtime ?
          chrome.runtime.lastError : chrome.extension.lastError;
      if (error) {
        handleUploadError(error);
      } else {
        chrome.browserAction.setIcon({path: 'icon19-uploading.png'});

        // We're going to reset the icon when the data is copied, but if it never
        // is (or if we somehow miss that notification), then make sure that it does
        // eventually go back to normal.
        // TODO(mihaip): use alarm API when switching to event pages.
        setTimeout(function() {
          chrome.browserAction.setIcon({path: 'icon19.png'});
        }, 30 * 1000);
      }
    });
  });
});

function handleUploadError(error) {
  chrome.browserAction.setIcon({path: 'icon19-error.png'});
  var errorNotification = webkitNotifications.createNotification(
      chrome.extension.getURL('icon32-error.png'),
      'Error pushing clipboard',
      error.message || '');
  errorNotification.replaceId = 'clipboard-data-error';
  errorNotification.show();
  errorNotification.onclose = function() {
    chrome.browserAction.setIcon({path: 'icon19.png'});
  }
  // TODO(mihaip): use alarm API when switching to event pages.
  setTimeout(errorNotification.close.bind(errorNotification), 10 * 1000);
}

// TODO(mihaip): always use chrome.runtime once Chrome 22 hits stable.
if (chrome.runtime && chrome.runtime.onInstalled) {
  chrome.runtime.onInstalled.addListener(function() {
    hasClientInfo(function(hasClientInfo) {
      if (!hasClientInfo) {
        chrome.tabs.create({url: 'options.html'});
      }
    });
  });
}

chrome.storage.onChanged.addListener(function(changes, storageNamespace) {
  if (storageNamespace != 'sync'|| !CLIPBOARD_DATA_KEY in changes) {
    return;
  }

  var data = changes[CLIPBOARD_DATA_KEY].newValue;

  // Another client copied the data, therefore we can reset the icon and dismiss
  // our notification (if any).
  if (!data) {
    chrome.browserAction.setIcon({path: 'icon19.png'});
    if (currentNotification) {
      currentNotification.close();
      currentNotification = undefined;
    }
    return;
  }

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

    chrome.browserAction.setIcon({path: 'icon19-downloading.png'});

    // We use the legacy notifications API since it supports icon URLs. The
    // new one doesn't (as implemented in WebKit).
    currentNotification = webkitNotifications.createNotification(
        chrome.extension.getURL('icon32-downloading.png'),
        'Clipboard pushed from ' + sourceClientInfo.name,
        'Click to copy "' + clipboardDataSnippet + '"');
    currentNotification.replaceId = 'clipboard-data-notification';
    currentNotification.show();
    currentNotification.onclick = function() {
      setClipboardData(clipboardData);
      currentNotification.close();

      // Remove the synced data as a way of notifying the other clients that
      // they can dismiss their notifications.
      chrome.storage.sync.remove(CLIPBOARD_DATA_KEY);
    }

    currentNotification.onclose = function() {
      currentNotification = undefined;
      chrome.browserAction.setIcon({path: 'icon19.png'});
    };
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
