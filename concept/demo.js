const ENV_PATH = require('path').resolve(__dirname + '/../', '.env');
require('dotenv').config({ path: ENV_PATH });

const _ = require('lodash');
const moment = require('moment');

const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

const MESSAGES = require('./messages');
const NOTES = require('./notes');

const dataService = require('./data_service');
const helpers = require('./helpers');

const USERS = {};

const getUser = ctx => {
  if (!USERS[ctx.from.id]) {
    USERS[ctx.from.id] = {};
  }
  return USERS[ctx.from.id];
};

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => ctx.reply(MESSAGES.WELCOME));

const greetUser = ctx => {
  var name = helpers.getUserName(ctx);
  return ctx.reply(`Hello, ${name}!`);
};

bot.hears(/(hi|hello|hey).?$/i, ctx => greetUser(ctx));

const ELEMENTS = {};

const composeMensaList = ctx => {
  ELEMENTS.MENSA_LIST = dataService.MENSAS.map(mensa => {
    return `*${mensa.name}*\n📍${mensa.address}`;
  }).join('\n');
};

dataService.initialise().then(() => {
  composeMensaList(null);

  ELEMENTS.MENSA_KEYS = Extra.HTML().markup(m => {
    var inlineKeys = dataService.MENSAS.map(mensa => {
      return m.callbackButton(mensa.nickname, 'setmensa:' + mensa.id);
    });
    return m.inlineKeyboard(inlineKeys);
  });

  ELEMENTS.DIET_KEYS = Extra.HTML().markup(m => {
    var diets = Object.keys(NOTES.DIETS);
    var inlineKeys = diets.map(diet => {
      return m.callbackButton(NOTES.DIETS[diet], 'setdiet:' + diet);
    });
    return m.inlineKeyboard(inlineKeys);
  });

});

const showMensaList = ctx => {
  return ctx.replyWithMarkdown(ELEMENTS.MENSA_LIST);
};

const promptMensaSelection = ctx => {
  return ctx.reply(MESSAGES.MENSA_SELECTION_PROMPT, ELEMENTS.MENSA_KEYS);
};

const listMensas = ctx => {
  return ctx.replyWithMarkdown(MESSAGES.MENSAS_PROMPT)
    .then(() => showMensaList(ctx))
    .then(() => promptMensaSelection(ctx));
};

bot.command('mensas', ctx => {
  listMensas(ctx);
});

bot.command('mensa', ctx => {
  promptMensaSelection(ctx);
});

const findNextDates = mensaId => {
  var datesIndex = dataService.DATES[mensaId];
  var dates = Object.keys(datesIndex);
  var now = _.now();
  var sorted = _.orderBy(dates, dateString => {
    var date = datesIndex[dateString];
    return Math.abs(now - date);
  }, 'asc');
  return sorted;
};

const filterByDiet = (diet, menu) => {
  return menu.filter(item => {
    var notes = item.notes || [];
    // Notes must contain diet label
    return _.includes(notes, diet);
  });
};

const groupItemsByCategory = items => {
  return _.groupBy(items, 'category');
};

const showMenuItems = (ctx, menu, date) => {
  var user = getUser(ctx);
  if (user.diet) {
    menu = filterByDiet(user.diet, menu);
  }
  menu = groupItemsByCategory(menu);
  var mensaName = dataService.MENSA_INDEX[user.mensaId].name;
  var readableDate = moment(date).format('dddd, D. MMMM');
  var formatted = '📍' + mensaName + ', ' + readableDate + '\n';
  dataService.categories.forEach(category => {
    var displayedHeading = dataService.HEADINGS[category];
    var items = menu[category] || [];
    if (items.length) {
      formatted += displayedHeading + '\n';
    }
    items.forEach(item => {
      var price = item.prices.students ?
        item.prices.students.toFixed(2) + '€' : ' .--';
      var line = '  ';
      line +=  '_' + price + '_' + '\t ';
      line += item.name + '\n';
      formatted += line;
    });
  });
  return ctx.replyWithMarkdown(formatted);
};

const showMenu = ctx => {
  var user = getUser(ctx);
  if (!user.mensaId) {
    return promptMensaSelection(ctx);
  }
  var nextDates = findNextDates(user.mensaId);
  var today = _.first(nextDates);
  var menu = dataService[user.mensaId][today];
  showMenuItems(ctx, menu, today);
};

bot.command('menu', ctx => {
  showMenu(ctx);
});

const promptDietSelection = ctx => {
  return ctx.reply(MESSAGES.DIET_PROMPT, ELEMENTS.DIET_KEYS);
};

bot.command('diet', ctx => {
  promptDietSelection(ctx);
});

bot.action(/^setmensa:(\d+)/, (ctx) => {
  var user = getUser(ctx);
  user.mensaId = ctx.match[1];
  var mensaName = dataService.MENSA_INDEX[user.mensaId].name;
  return ctx.replyWithMarkdown(MESSAGES.MENSA_CONFIRMATION + '*' + mensaName + '*')
    .then(() => showMenu(ctx));
});

const confirmDiet = (diet, ctx) => {
  var user = getUser(ctx);
  var displayedDiet = user.diet ? NOTES.DIETS[user.diet] : 'None';
  return ctx.reply(MESSAGES.DIET_CONFIRMATION + displayedDiet)
    .then(() => showMenu(ctx));
};

bot.action(/^setdiet:(.+)/, (ctx) => {
  var user = getUser(ctx);
  var diet = ctx.match[1];
  user.diet = diet === 'none' ? null : diet;
  confirmDiet(user.diet, ctx);
});

bot.hears(/vegetarian/i, ctx => {
  var user = getUser(ctx);
  user.diet = 'vegetarisch';
  confirmDiet(user.diet, ctx);
});

bot.hears(/where can i (eat|go)/i, ctx => {
  listMensas(ctx);
});

bot.hears(/for lunch/i, ctx => {
  showMenu(ctx);
});

bot.hears(/(another|different|change|choose|show) mensa/i, ctx => {
  promptMensaSelection(ctx);
});

// bot.action(/.+/, (ctx) => {
//   return ctx.answerCbQuery(`${ctx.match[0]}`);
// });

// Start bot server
bot.launch();
