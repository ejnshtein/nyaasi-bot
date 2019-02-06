const Composer = require('telegraf/composer')
const composer = new Composer()
const { buttons, loadSearchParams } = require('../lib')
const { getTorrent } = require('../nyaasi')

composer.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, async ctx => {
  ctx.answerCbQuery('')
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${value ? `&q=${value}` : ''}`
  const torrent = await getTorrent(ctx.match[1])
  let messageText = `${torrent.title}\n`
  messageText += `<code>${torrent.links.magnet}</code><a href="${searchUrl}">&#8203;</a>`
  ctx.editMessageText(messageText, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: buttons.back,
            callback_data: `t=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
          }
        ]
      ]
    }
  })
})

module.exports = app => {
  app.use(composer.middleware())
}
