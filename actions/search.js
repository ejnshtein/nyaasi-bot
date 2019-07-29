const Composer = require('telegraf/composer')
const composer = new Composer()
const { searchTorrentView } = require('../generators')
const { loadSearchParams } = require('../lib')

composer.action(/^p=(\S+):o=(\S+)$/ig, async ctx => {
  const page = Number.parseInt(ctx.match[1])
  const offset = Number.parseInt(ctx.match[2])
  const { value } = loadSearchParams(ctx.callbackQuery.message, page, offset)
  try {
    var { text, extra } = await searchTorrentView(value, page, offset)
  } catch (e) {
    return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
  ctx.answerCbQuery('')
  ctx.editMessageText(text, extra)
})

module.exports = app => {
  app.use(composer.middleware())
}
