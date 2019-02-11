const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const getMenus = require('./menus');
const MENSAS = require('./mensas');

const DATA_API_PORT = 3001;

app.get('/mensas', (req, res) => {
  return res.json(MENSAS);
});

app.get('/menus/:mensaId', (req, res) => {
  var menus = getMenus(req.params.mensaId);
  if (!menus) {
    return res.send('Error: No menus found.');
  }
  return res.json(menus);
});

app.listen(DATA_API_PORT);
