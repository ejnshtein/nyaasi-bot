const Composer = require('telegraf/composer')
const composer = new Composer()

composer.action(/^d=([0-9]+)$/, async (ctx) => {
  const caption = `<a href="https://nyaa.si/view/${ctx.match[1]}">nyaa.si/view/${ctx.match[1]}</a>`
  try {
    await ctx.replyWithDocument({
      url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
      filename: `${ctx.match[1]}.torrent`
    }, {
      caption: caption,
      reply_to_message_id: ctx.callbackQuery.message.message_id,
      parse_mode: 'HTML'
    })
  } catch (e) {
    ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
})

// composer.action(/^download:(\S+);&/, (ctx) => {
//   ctx.answerCbQuery('')
//   ctx.replyWithDocument(`https://nyaa.si/download/${ctx.match[1]}.torrent`)
// })

module.exports = app => {
  app.use(composer.middleware())
}
