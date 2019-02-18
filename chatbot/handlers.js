const _ = require('lodash');
const helpers = require('./helpers');
const MESSAGES = require('./messages');
const dataService = require('./bot_data_service');
const NOTES = require('../static_data/notes');

const moment = require('moment');
const Telegraf = require('telegraf');
const Extra = require('telegraf/extra');
const Markup = require('telegraf/markup');

var MENSAS = [];

const getMensaKeys = user => {
  return getMensas(user).then(mensas => {
    return Extra.HTML().markup(m => {
      var inlineKeys = mensas.map(mensa => {
        return m.callbackButton(mensa.nickname, 'setmensa:' + mensa.id);
      });
      return m.inlineKeyboard(inlineKeys);
    });
  });
};

var DIET_KEYS = Extra.HTML().markup(m => {
  var diets = Object.keys(NOTES.DIETS);
    var inlineKeys = diets.map(diet => {
      return m.callbackButton(NOTES.DIETS[diet], 'setdiet:' + diet);
    });
  return m.inlineKeyboard(inlineKeys);
});

const greetUser = ctx => {
  var name = helpers.getUserName(ctx);
  return ctx.reply(`Hello, ${name}!`);
};

const tryAgain = ctx => {
  var name = helpers.getUserName(ctx);
  return ctx.reply(`Sorry, ${name}. I don't know how to process that.`);
};

const refreshMensas = user => {
  var userLocation = null;
  if (user && user.location) {
    userLocation = [user.location.latitude, user.location.longitude];
  }
  return dataService.getMensas(userLocation).then(mensas => {
    MENSAS = mensas;
    return mensas;
  });
};

const getMensas = user => {
  return new Promise((resolve, reject) => {
    if (_.isEmpty(MENSAS)) {
      console.log('Fetching Mensas.');
      refreshMensas(user).then(data => {
        resolve(data);
      });
    } else {
      resolve(MENSAS);
    }
  });
};

const showNearest = (ctx, user) => {
  var mensa = MENSAS[0];
  var message = `The nearest Mensa is ${mensa.distance}m away:\n`;
  message += `*${mensa.name}*\n📍${mensa.address}`;
  return ctx.replyWithMarkdown(message);
};

const nearest = (ctx, user) => {
  if (!user.location) {
    return ctx.reply(MESSAGES.LOCATION_UNSET);
  }
  return showNearest(ctx, user);
};

const listMensas = (ctx, user) => {
  return getMensas(user).then(mensas => {
    var message = MESSAGES.MENSAS_PROMPT + '\n';
    message += mensas.map(mensa => {
      return `*${mensa.name}*\n📍${mensa.address}`;
    }).join('\n');
    return ctx.replyWithMarkdown(message);
  });
};

const setLocation = (ctx, user) => {
  var location = ctx.message.location;
  user.location = location;
  refreshMensas(user).then(() => {
    return showNearest(ctx, user);
  });
  return ctx.reply(MESSAGES.LOCATION_SET);
};

const showSelectedMensa = (ctx, user) => {
  var mensaId = user.mensaId;
  if (!mensaId) {
    return selectMensa(ctx, user);
  }
  return getMensas(user).then(mensas => {
    var mensa = _.find(mensas, { id: mensaId });
    var message = `Your selected Mensa is:\n`;
    message += `*${mensa.name}*\n📍${mensa.address}`;
    return ctx.replyWithMarkdown(message);
  });
};

const selectMensa = (ctx, user, entities) => {
  var mensaId = Number(_.get(entities, 'mensa_name.stringValue'));
  if (mensaId) {
    return setMensaId(ctx, user, mensaId);
  }
  return getMensaKeys(user).then(keys => {
    ctx.reply(MESSAGES.MENSA_SELECTION_PROMPT, keys);
  });
};

const setMensaId = (ctx, user, mensaId) => {
  return getMensas(user).then(mensas => {
    if (!mensaId) {
      mensaId = Number(ctx.match[1]);
    }
    user.mensaId = mensaId;
    var mensa = _.find(mensas, { id: mensaId });
    if (!mensa) {
      return;
    }
    var message = MESSAGES.MENSA_CONFIRMATION + '*' + mensa.name + '*';
    return ctx.replyWithMarkdown(message);
  });
};


const groupItemsByCategory = items => {
  return _.groupBy(items, 'category');
};

const getSelectedMensa = (ctx, user) => {
  if (!user.mensaId) {
    return selectMensa(ctx, user);
  }
  return getMensas(user).then(mensas => {
    return _.find(mensas, { id: user.mensaId });
  });
};


const showMenuItems = (ctx, mensa, menu, date) => {
  // if (user.diet) {
  //   menu = filterByDiet(user.diet, menu);
  // }
  menu = groupItemsByCategory(menu);

  var mensaName = mensa.name;
  var readableDate = moment(date).format('dddd, D. MMMM');
  var formatted = '📍' + mensaName + ', ' + readableDate + '\n';
  dataService.MENU_HEADINGS.forEach(category => {
    var displayedHeading = dataService.MENU_HEADINGS_INDEX[category];
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


const showMenu = (ctx, user, entities) => {
  var mensaId = Number(_.get(entities, 'mensa_name.stringValue'));
  // Temporary fix...
  if (mensaId) {
    user.mensaId = mensaId;
  }
  return getSelectedMensa(ctx, user).then(mensa => {
    if (!mensa) {
      return;
    }
    var mensaId = mensa.id;

    var dateString = _.get(entities, 'date.stringValue');
    var userDate = dateString ? moment(dateString).format('YYYY-MM-DD') : null;
    var today = moment().format('YYYY-MM-DD');
    var date = userDate || today;
    return dataService.getMenu(mensaId, date).then(menu => {
      if (!menu) {
        return ctx.reply("No menu to show.");
      }
      return showMenuItems(ctx, mensa, menu, date);
    });
  });
};

const showHours = (ctx, user) => {
  return getSelectedMensa(ctx, user).then(mensa => {
    if (!mensa) {
      return;
    }
    var mensaId = mensa.id;
    ///
    var date = moment().format('YYYY-MM-DD');
    ///
    return dataService.getHours(mensaId, date).then(hours => {
      if (!hours) {
        return ctx.reply("The Mensa is not open on this day.");
      }
      var open = moment(date)
        .hour(hours.open.hour)
        .minute(hours.open.minute);
      var close = moment(date)
        .hour(hours.close.hour)
        .minute(hours.close.minute);

      var readableDate = moment(date).format('dddd, D. MMMM');
      var message = '📍' + mensa.name + ', ' + readableDate + '\n';
      message += "Open: " + open.fromNow();
      message += "\nClose: " + close.fromNow();
      return ctx.replyWithMarkdown(message);
    });
  });
};

const HANDLERS = {
  greeting: greetUser,
  try_again: tryAgain,
  set_location: setLocation,
  nearest: nearest,
  mensa_list: listMensas,
  show_address: showSelectedMensa,
  select_mensa: selectMensa,
  set_mensa_id: setMensaId,
  show_menu: showMenu,
  show_hours: showHours
};

module.exports = HANDLERS;