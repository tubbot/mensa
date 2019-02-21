const ENV_PATH = require('path').resolve(__dirname + '/../', '.env');
require('dotenv').config({ path: ENV_PATH });

const _ = require('lodash');
const moment = require('moment');

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const MESSAGES = require('./messages');
const NOTES = require('../static_data/notes');

const helpers = require('./helpers');
const dataService = require('./bot_data_service');
const handlers = require('./handlers');
// DialogFlow wrapper
const resolveIntent = require('./intent');

/// SESSION MANAGEMENT ///
const USERS = {};
const getUser = ctx => {
  if (!USERS[ctx.from.id]) {
    USERS[ctx.from.id] = {};
  }
  return USERS[ctx.from.id];
};
/// END SESSION MANAGMENT ///

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => ctx.reply(MESSAGES.WELCOME));

const dispatchIntent = (parsed, ctx) => {
  var intent = parsed.intent;
  var entities = parsed.entities;
  var user = getUser(ctx);
  console.log('Intent: '+ intent);
  if (intent === "try_again") {
    return handlers.try_again(ctx, user);
  }
  if (intent === "greeting") {
    return handlers.greeting(ctx);
  }
  if (intent === "mensas_list") {
    return handlers.mensa_list(ctx, user);
  }
  if (intent === "mensa_nearest") {
    return handlers.nearest(ctx, user);
  }
  if (intent === "mensa_set") {
    return handlers.select_mensa(ctx, user, entities);
  }
  if (intent === "mensa_address") {
    return handlers.show_address(ctx, user, entities);
  }
  if (intent === "show_menu") {
    return handlers.show_menu(ctx, user, entities);
  }
  if (intent === "hours_open") {
    return handlers.show_hours(ctx, user, entities, 'open');
  }
  if (intent === "hours_close") {
    return handlers.show_hours(ctx, user, entities, 'close');
  }
  if (intent === "is_open") {
    return handlers.show_hours(ctx, user, entities, 'is');
  }
  if (intent === "diet_set") {
    return handlers.set_diet(ctx, user, entities);
  }
  if (intent === "menu_by_diet") {
    return handlers.show_menu_by_diet(ctx, user, entities);
  }
};

// Universal Dispatcher //
bot.hears(/.?/i, ctx => {
  var userText = ctx.message.text;
  return resolveIntent(userText)
  .catch(error => {
    console.log(error);
  }).then(result => {
    try {
      return dispatchIntent(result, ctx);
    }
    catch (error) {
      console.log(error);
    }
  });
});



bot.on('location', ctx => {
  var user = getUser(ctx);
  return handlers.set_location(ctx, user);
});

bot.action(/^setmensa:(\d+)/, (ctx) => {
  var user = getUser(ctx);
  return handlers.set_mensa_id(ctx, user);
});

// diet_set
// diet_unset
// haz_list
// haz_add
// haz_drop

// SET ROLE e.g. student vs. employee



// Start bot server
bot.launch();
