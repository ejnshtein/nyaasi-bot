const Composer = require('telegraf/composer')
const composer = new Composer()

composer.action(/^d=([0-9]+)$/, async (ctx) => {
  const caption = `<a href="https://${process.env.HOST}/view/${ctx.match[1]}">${process.env.HOST}/view/${ctx.match[1]}</a>`
  try {
    await ctx.replyWithDocument({
      url: `https://${process.env.HOST}/download/${ctx.match[1]}.torrent`,
      filename: `${ctx.match[1]}.torrent`
    }, {
      caption: caption,
      reply_to_message_id: ctx.callbackQuery.message.message_id,
      parse_mode: 'HTML'
    })
  } catch (e) {
    ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
  ctx.answerCbQuery('')
})

module.exports = app => {
  app.use(composer.middleware())
}
