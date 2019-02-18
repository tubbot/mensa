const request = require('request-promise');

const API_URL = 'http://mensabot.qu.tu-berlin.de:3003/resolve';

const intentResolver = text => {
  var uri = API_URL;
  var options = {
    method: 'POST',
    uri: uri,
    json: true,
    body: {
      text: text
    }
  };
  return request(options);
};

module.exports = intentResolver;
