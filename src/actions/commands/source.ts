import { Composer } from 'grammy'
import { bot } from 'src/bot'
import { onlyPrivate } from 'src/middlewares/only-private'

const composer = new Composer()

composer.filter(onlyPrivate).command('source', (ctx) =>
  ctx.reply(
    'My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">Github</a>',
    {
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
    }
  )
)

bot.use(composer.middleware())
