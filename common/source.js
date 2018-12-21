const { bot } = require('../core/bot')
bot.command('source', ({ reply }) => {
  reply('My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">Github</a>', {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Bot source code',
          url: 'https://github.com/ejnshtein/nyaasi-bot'
        }]
      ]
    }
  })
})
