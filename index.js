require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start((ctx) => ctx.reply('Guts welcomes you to his bot ⚔️'));
bot.on('sticker', (ctx) => ctx.reply('😠'));
bot.command('WhoMadeYou', (ctx) => ctx.reply('GutsDaksha'));

bot.hears('Menu', (ctx) =>
  ctx.reply('🧾 *Bot Features*:\n\n' +
    '🎲 /roll - Roll a dice\n' +
    '💬 /ask - Ask ChatGPT\n' +
    '🔍 /define [word] - Get dictionary meaning', {
      parse_mode: 'Markdown',
      ...Markup.inlineKeyboard([
        [Markup.button.callback('Dictionary', 'Oxford')],
        [Markup.button.callback('Weather There', 'Weather')],
        [Markup.button.callback('💬 Ask ChatGPT', 'chat')],
        [Markup.button.callback('Url Shortner', 'URL')],
        [Markup.button.callback('🎲 Roll Dice', 'roll')]
      ])
    })
);

let expectingWord = false;

bot.action('Oxford', (ctx) => {
  expectingWord = true;
  ctx.reply('📖 Send the word you want to look up');
});


let expectingCity = false;

bot.action('Weather', (ctx) => {
  expectingCity = true;
  ctx.reply('🌍 Send me the city name to get weather info');
});
bot.on('text', async (ctx) => {
  const text = ctx.message.text;

  if (expectingWord) {
    expectingWord = false;

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${text}`);
      const meaning = res.data[0].meanings[0].definitions[0].definition;
      ctx.reply(`📚 *${text}*:\n_${meaning}_`, { parse_mode: 'Markdown' });
    } catch (err) {
      ctx.reply('❌ Word not found');
    }

    return; // avoid checking weather too
  }

  if (expectingCity) {
    expectingCity = false;

    try {
      const res = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${text}&appid=${process.env.OPENWEATHER_API}&units=metric`
      );

      const temp = res.data.main.temp;
      const desc = res.data.weather[0].description;
      const feels = res.data.main.feels_like;
      const humidity = res.data.main.humidity;

      ctx.reply(
        `🌤️ *Weather in ${text}*:\n\n` +
        `🌡️ Temperature: *${temp}°C*\n` +
        `🤔 Feels like: *${feels}°C*\n` +
        `💧 Humidity: *${humidity}%*\n` +
        `📝 Condition: _${desc}_`,
        { parse_mode: 'Markdown' }
      );
    } catch (err) {
      ctx.reply('❌ Couldn’t fetch weather. Please check the city name.');
    }

    return;
  }

  // If no flags are set
  ctx.reply("❓ I didn't understand that. Type `Menu` to see available features.");
});




// console.log("BOT_TOKEN:", process.env.BOT_TOKEN);
bot.launch();
