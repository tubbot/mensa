const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const _ = require('lodash');
const helpers = require('./helpers');

const app = express();

app.use(cors());
app.use(bodyParser.json());

const DATA_API_PORT = 3002;

const DATA = require('./data_service');
DATA.initialise();

// mensas_list
// mensa_nearest
app.post('/mensas-list', (req, res) => {
  try {
    var params = req.body;
    var userLocation = params.coordinates || null;
    var mensas = DATA.MENSAS;
    if (userLocation) {
      mensas = helpers.addDistanceField(userLocation, _.clone(mensas));
      mensas = _.sortBy(mensas, 'distance');
    }
    res.json(mensas);
  }
  catch(error) { console.log(error); }
  return;
});

// mensa_address

// menu_all
// menu_main
// menu_salad
// menu_soup

app.post('/menu', (req, res) => {
  try {
    var params = req.body;
    var mensaId = params.mensaId;
    if (!mensaId || !DATA[mensaId]) {
      // Wrong Mensa ID
      return res.send(null);
    }
    var date = params.date;
    if (!DATA[mensaId][date]){
      // No data or not open on the day
      return res.json(false);
    }
    var menu = DATA[mensaId][date];
    if (params.diet) {
      menu = menu.filter(item => {
        if (_.isEmpty(item.notes)) {
          // Strict filter, reject when there's no information
          return false;
        }
        return _.includes(item.notes, params.diet);
      });
    }
    if (params.exclude) {
      menu = menu.filter(item => {
        if (_.isEmpty(item.notes)) {
          return true;
        }
        return _.isEmpty(_.intersection(item.notes, params.exclude));
      });
    }
    res.json(menu);
  }
  catch(error) { console.log(error); }
  return;
});


// is_open
// hours_open
// hours_close

app.post('/hours', (req, res) => {
  try {
    var params = req.body;
    var mensaId = params.mensaId;
    if (!mensaId || !DATA[mensaId]) {
      // Wrong Mensa ID
      return res.send(null);
    }
    var mensa = DATA.MENSA_INDEX[mensaId];
    var date = params.date;
    if (!DATA[mensaId][date]){
      // No data or not open on the day
      return res.json(false);
    }
    var hoursText = mensa.hours.split(' ')[1];
    var hoursList = hoursText.split('-');
    var open = hoursList[0].split(':');
    var close = hoursList[1].split(':');
    var hours = {
      date: date,
      open: {
        hour: open[0],
        minute: open[1]
      },
      close: {
        hour: close[0],
        minute: close[1]
      },
    };
    res.json(hours);
  }
  catch(error) { console.log(error); }
  return;
});

app.listen(DATA_API_PORT);

// greeting
// try_again

// mensa_set

// diet_set
// diet_unset
// haz_list
// haz_add
// haz_drop
