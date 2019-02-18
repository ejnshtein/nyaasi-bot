const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')

composer.command('source',
  onlyPrivate,
  Composer.reply('My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">Github</a>', {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Bot source code',
            url: 'https://github.com/ejnshtein/nyaasi-bot'
          }
        ]
      ]
    }
  })
)

module.exports = app => {
  app.use(composer.middleware())
}
