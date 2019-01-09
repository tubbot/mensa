const path = require('path');
const DATA = require('./dummy_data');

require('dotenv').config({
  path: path.resolve(__dirname + '/../', '.env')
});

const Telegraf = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Welcome'));

bot.hears(/(hi|hello|hey).?$/i, ctx => {
  ctx.reply('Hey there!');
});

bot.hears(/where|location|address/i, ctx => {
  ctx.replyWithMarkdown(DATA.directions);
  bot.telegram.sendVenue(
    ctx.chat.id,
    DATA.latitude,
    DATA.longitude,
    DATA.title,
    DATA.address
  );
});

bot.hears(/open|hours/i, ctx => {
  ctx.replyWithMarkdown(DATA.hours);
});

bot.hears(/menu|lunch|food/i, ctx => {
  ctx.replyWithMarkdown(DATA.menu);
});

bot.startPolling();
