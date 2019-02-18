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

// greeting
bot.hears(/(hi|hello|hey).?$/i, handlers.greeting);

// try_again
bot.command('gibberish', handlers.try_again);

// mensas_list
bot.command('list', ctx => {
  var user = getUser(ctx);
  return handlers.mensa_list(ctx, user);
});

bot.on('location', ctx => {
  var user = getUser(ctx);
  return handlers.set_location(ctx, user);
});

// mensa_nearest
// recalculate in case the user locaiton has changed
bot.command('nearest', ctx => {
  var user = getUser(ctx);
  return handlers.nearest(ctx, user);
});

// mensa_address
bot.command('address', ctx => {
  var user = getUser(ctx);
  return handlers.show_address(ctx, user);
});

bot.command('set_mensa', ctx => {
  var user = getUser(ctx);
  return handlers.select_mensa(ctx, user);
});

bot.action(/^setmensa:(\d+)/, (ctx) => {
  var user = getUser(ctx);
  return handlers.set_mensa_id(ctx, user);
});

// menu_all
// menu_main
// menu_salad
// menu_soup

bot.command('menu', ctx => {
  var user = getUser(ctx);
  return handlers.show_menu(ctx, user);
});

// is_open
// hours_open
// hours_close
bot.command('hours', ctx => {
  var user = getUser(ctx);
  return handlers.show_hours(ctx, user);
});


// diet_set
// diet_unset
// haz_list
// haz_add
// haz_drop

// SET ROLE e.g. student vs. employee



// Start bot server
bot.launch();
