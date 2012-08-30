onload = function() {
  var clientInfo;
  var preferences;
  var clientNameNode = document.getElementById('client-name');
  var autoDimissTimeoutNode = document.getElementById('auto-dismiss-timeout');

  hasClientInfo(function(hasClientInfo) {
    if (!hasClientInfo) {
      document.getElementById('intro').style.display = 'block';
    }

    getClientInfo(function(loadedClientInfo) {
      clientInfo = loadedClientInfo;
      clientNameNode.value = clientInfo.name;
    });
  });

  getPreferences(function(loadedPreferences) {
    preferences = loadedPreferences;
    for (var i = 0, option; option = autoDimissTimeoutNode.options[i]; i++) {
      if (option.value == preferences.autoDismissTimeout) {
        autoDimissTimeoutNode.selectedIndex = i;
        break;
      }
    }
  });

  document.getElementById('options-form').onsubmit = function(event) {
    event.preventDefault();
    clientInfo.name = clientNameNode.value;
    var n = autoDimissTimeoutNode;
    preferences.autoDismissTimeout =
        parseInt(n.options[n.selectedIndex].value, 10);
    setClientInfo(clientInfo, function() {
      setPreferences(preferences, function() {
        location.reload();
      });
    });
  };
};