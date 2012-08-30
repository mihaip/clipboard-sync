onload = function() {
  hasClientInfo(function(hasClientInfo) {
    if (!hasClientInfo) {
      document.getElementById('intro').style.display = 'block';
    }

    getClientInfo(function(clientInfo) {
      var clientNameNode = document.getElementById('client-name');
      clientNameNode.value = clientInfo.name;

      document.getElementById('options-form').onsubmit = function(event) {
        event.preventDefault();
        clientInfo.name = clientNameNode.value;
        setClientInfo(clientInfo, function() {
          location.reload();
        });
      };
    });
  });
};