const Composer = require('telegraf/composer')
const composer = new Composer()

composer.action(/d=(\S+)/, (ctx) => {
  ctx.answerCbQuery('')
  const caption = `<a href="https://nyaa.si/view/${ctx.match[1]}">nyaa.si/view/${ctx.match[1]}</a>`
  ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
  }, {
    caption: caption,
    reply_to_message_id: ctx.callbackQuery.message.message_id,
    parse_mode: 'HTML'
  })
})

composer.action(/download:(\S+);/, (ctx) => {
  ctx.answerCbQuery('')
  ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
  })
})

module.exports = app => {
  app.use(composer.middleware())
}
