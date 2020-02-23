import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'

const composer = new Composer()

composer.command('source',
  Composer.privateChat(
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
)

bot.use(composer.middleware())
