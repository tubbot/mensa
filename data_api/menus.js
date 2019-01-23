const request = require('request-promise');

const DATA = {};

const MENSAS = require('./mensas');
const BASE_URL = "http://openmensa.org/api/v2/canteens/";

const loadDays = mensaId => {
  var url = BASE_URL + mensaId + '/days';
  var options = { uri: url, json: true };
  return request(options).then(dates => {
    dates.filter(day => !day.closed)
      .filter(day => !day.date.startsWith('4012'))
      .forEach(day => {
        return loadMenuOnDay(mensaId, day.date);
      });
  });
};

const loadMenuOnDay = (mensaId, date) => {
  var url = `${BASE_URL}${mensaId}/days/${date}/meals`;
  var options = { uri: url, json: true };
  return request(options).then(menu => {
    DATA[mensaId][date] = menu;
    console.log('Retrieved: ' + mensaId + '\t' + date);
  });
};

const loadData = () => {
  return MENSAS.forEach(mensa => {
    var mensaId = mensa.id;
    // Initialise data store
    DATA[mensaId] = {};
    loadDays(mensaId);
  });
};

const RELOAD_PERIOD = 1000 * 60 * 60 * 12;
setInterval(() => {
  loadData();
}, RELOAD_PERIOD);

loadData();

const menus = mensaId => {
  return DATA[mensaId];
};

module.exports = menus;
