const request = require('request-promise');
const moment = require('moment');

const DATA = {};

DATA.DATES = {};

const loadMensas = () => {
  var uri = 'http://mensabot.qu.tu-berlin.de:3001/mensas';
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
    var uri = 'http://mensabot.qu.tu-berlin.de:3001/menus/' + mensa.id;
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

DATA.HEADINGS = {
  'Essen': '🥘 *Mains*',
  'Beilagen': '🍚 *Sides*',
  'Suppen': '🍲 *Soups*',
  'Salate': '🥗 *Salads*',
  'Desserts': '🍰 *Desserts*',
};

DATA.categories = Object.keys(DATA.HEADINGS);

module.exports = DATA;