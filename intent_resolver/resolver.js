const dialogflow = require('dialogflow');
const uuid = require('uuid');
const _ = require('lodash');

const PROJECT_ID = "mensaagent";

var sessionId;
var sessionClient;
var sessionPath;

const renewSession = () => {
  sessionId = uuid.v4();
  sessionClient = new dialogflow.SessionsClient();
  sessionPath = sessionClient.sessionPath(PROJECT_ID, sessionId);
};

renewSession();
const RENEWAL_INTERVAL = 1000 * 60 * 20;
setInterval(() => { renewSession(); }, RENEWAL_INTERVAL);

const getIntent = (userText) => {
  if (!userText) { return; }
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userText,
        languageCode: 'en-US',
      },
    },
  };
  return sessionClient.detectIntent(request);
};

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());


const DATA_API_PORT = 3003;

app.get('/resolve', (req, res) => {
  return res.json(MENSAS);
});

app.post('/resolve', (req, res) => {
  try {
    var params = req.body;
    var userText = params.text;
    getIntent(userText).then(responses => {
      var result = responses[0].queryResult;
      var resolved = {
        intent: _.get(result, 'intent.displayName'),
        entities: _.get(result, 'parameters.fields'),
      };
      res.json(resolved);
    });
  }
  catch(error) { console.log(error); }
  return;
});

app.listen(DATA_API_PORT);

