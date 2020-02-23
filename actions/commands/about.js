import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'

const composer = new Composer()

const text = `I'm <a href="https://${process.env.HOST}">${process.env.HOST}</a> website bot.
For now, I can search for torrents on <a href="https://${process.env.HOST}">${process.env.HOST}</a> (＾◡＾)っ.
More features will arrive soon! ( ͡~ ͜ʖ ͡°)

I'm still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ

My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>`

composer.command(
  'about',
  Composer.privateChat(
    Composer.reply(text, { parse_mode: 'HTML' })
  )
)

bot.use(composer.middleware())
