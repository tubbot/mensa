const request = require('request-promise');
const moment = require('moment');

const BASE_URL = "http://mensabot.qu.tu-berlin.de:3001/";

const DATA = {};

DATA.DATES = {};

const loadMensas = () => {
  var uri = BASE_URL + 'mensas';
  var options = { uri: uri, json: true };
  return request(options).then(mensas => {
    DATA.MENSAS = mensas;
    DATA.MENSA_INDEX = mensas.reduce((index, mensa) => {
      index[mensa.id] = mensa;
      return index;
    }, {});
    return mensas;
  });
};

const indexDates = (mensaId, menus) => {
  var dates = Object.keys(menus);
  DATA.DATES[mensaId] = dates.reduce((index, dateString) => {
    index[dateString] = moment(dateString);
    return index;
  }, {});
};

const loadMenus = () => {
  if (!DATA.MENSAS) { return; }
  DATA.MENSAS.forEach(mensa => {
    var uri = BASE_URL + 'menus/' + mensa.id;
    var options = { uri: uri, json: true };
    return request(options).then(menus => {
      DATA[mensa.id] = menus;
      indexDates(mensa.id, menus);
    });
  });
};

const initialise = () => {
  return loadMensas().then(() => loadMenus());
};

DATA.initialise = initialise;

module.exports = DATA;