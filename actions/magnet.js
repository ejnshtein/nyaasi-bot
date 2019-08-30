const Composer = require('telegraf/composer')
const composer = new Composer()
const { buttons, loadSearchParams, getXtFromMagnet } = require('../lib')
const { getTorrent } = require('../nyaasi')

composer.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, async ctx => {
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  const searchUrl = `https://${process.env.HOST}/?p=${ctx.match[2]}${value ? `&q=${value}` : ''}`
  try {
    var torrent = await getTorrent(ctx.match[1])
  } catch (e) {
    return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
  ctx.answerCbQuery('')
  let messageText = `${torrent.title}\n`
  messageText += `<code>${torrent.links.magnet}</code><a href="${searchUrl}">&#8203;</a>`
  ctx.editMessageText(messageText, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Open magnet',
            url: `${process.env.MAGNET_REDIRECT_HOST}/nyaamagnet/${getXtFromMagnet(torrent.links.magnet)}`
          }
        ],
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
