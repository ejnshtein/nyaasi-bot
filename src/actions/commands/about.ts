import { Composer } from 'grammy'
import { bot } from 'src/bot'
import { onlyPrivate } from 'src/middlewares/only-private'

const composer = new Composer()

const text = `I'm <a href="https://${env.HOST}">${env.HOST}</a> website bot.
For now, I can search for torrents on <a href="https://${env.HOST}">${env.HOST}</a> (＾◡＾)っ.
More features will arrive soon! ( ͡~ ͜ʖ ͡°)

I'm still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ

My source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>`

composer
  .filter(onlyPrivate)
  .command('about', (ctx) => ctx.reply(text, { parse_mode: 'HTML' }))

bot.use(composer.middleware())
