const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')

composer.command('about',
  onlyPrivate,
  Composer.reply('I\'m <a href="https://nyaa.si">nyaa.si</a> website bot.\nFor now, I can search for torrents on <a href="https://nyaa.si">nyaa.si</a> (＾◡＾)っ.\nMore features will arrive soon! ( ͡~ ͜ʖ ͡°)\n\nI\'m still in beta, so please be patient! ( ﾉ ﾟｰﾟ)ﾉ\n\nMy source code at <a href="https://github.com/ejnshtein/nyaasi-bot">github</a>', {
    parse_mode: 'HTML'
  })
)

module.exports = app => {
  app.use(composer.middleware())
}
