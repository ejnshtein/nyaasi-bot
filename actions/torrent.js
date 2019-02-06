const Composer = require('telegraf/composer')
const composer = new Composer()
const { torrentView } = require('../generators')
const { loadSearchParams } = require('../lib')

composer.action([
  /^v=(\S+?):(\S+)$/i,
  /^t=(\S+?):(\S+)$/i
], async ctx => {
  ctx.answerCbQuery('')
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  try {
    var { text, extra } = await torrentView(ctx.match[1], value, ctx.match[2])
  } catch (e) {
    return ctx.answerCbQuery('Something went wrong...')
  }
  ctx.editMessageText(text, extra)
})

module.exports = app => {
  app.use(composer.middleware())
}
