const request = require('request-promise');
const moment = require('moment');
const _ = require('lodash');

const API_URL = 'http://mensabot.qu.tu-berlin.de:3002/';

const DATA = {};

DATA.getMensas = userLocation => {
  var uri = API_URL + 'mensas-list';
  var options = {
    method: 'POST',
    uri: uri,
    json: true,
    body: {}
  };
  if (!_.isEmpty(userLocation)) {
    options.body.coordinates = userLocation;
  }
  return request(options);
};

DATA.getMenu = (mensaId, date) => {
  var uri = API_URL + 'menu';
  var options = {
    method: 'POST',
    uri: uri,
    json: true,
    body: {
      mensaId: mensaId,
      date: date
    }
  };
  console.log("Requesting menu.");
  return request(options);
};

DATA.getHours = (mensaId, date) => {
  var uri = API_URL + 'hours';
  var options = {
    method: 'POST',
    uri: uri,
    json: true,
    body: {
      mensaId: mensaId,
      date: date
    }
  };
  console.log("Requesting hours.");
  return request(options);
};

DATA.MENU_HEADINGS_INDEX = {
  'Essen': '🥘 *Mains*',
  'Beilagen': '🍚 *Sides*',
  'Suppen': '🍲 *Soups*',
  'Salate': '🥗 *Salads*',
  'Desserts': '🍰 *Desserts*',
};

DATA.MENU_HEADINGS = Object.keys(DATA.MENU_HEADINGS_INDEX);

module.exports = DATA;