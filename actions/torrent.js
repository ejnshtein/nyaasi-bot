const Composer = require('telegraf/composer')
const composer = new Composer()
const { torrentView } = require('../generators')
const { loadSearchParams } = require('../lib')

composer.action([
  /^v=(\S+?):(\S+)$/i,
  /^t=(\S+?):(\S+)$/i
], async ctx => {
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  const { user } = ctx.state
  try {
    var { text, extra } = await torrentView(
      ctx.match[1],
      value,
      ctx.match[2],
      undefined,
      undefined,
      user.allow_get_torrent_files,
      user.allow_torrent_download
    )
  } catch (e) {
    return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
  ctx.answerCbQuery('')
  ctx.editMessageText(text, extra)
})

module.exports = app => {
  app.use(composer.middleware())
}
