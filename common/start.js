const { bot } = require('../core/bot')
const { buttons, buffer } = require('../lib')
const { view, keyboardPage } = require('../generators')
const { getView } = require('../nyaasi')

bot.start(async ctx => {
  if (/\/start (\S*)/i.test(ctx.message.text)) {
    const data = ctx.message.text.match(/\/start (\S*)/i)[1]
    const text = buffer.decode(data)
    if (/download:[0-9]+/i.test(text)) {
      const id = text.match(/download:([0-9]+)/i)[1]
      return ctx.replyWithDocument({
        url: `https://nyaa.si/download/${id}.torrent`,
        filename: `${id}.torrent`
      })
    } else if (/view:[0-9]+/i.test(text)) {
      const id = text.match(/view:([0-9]+)/i)[1]
      const searchUrl = 'https://nyaa.si/?p=1'
      const messageText = await view(id, searchUrl)
      const keyboard = [
        [{
          text: buttons.torrent.download,
          callback_data: `d=${id}`
        }, {
          text: buttons.torrent.magnet,
          callback_data: `magnet=${id}:p=1:o=0`
        }],
        [{
          text: buttons.page.refresh,
          callback_data: `v=${id}:p=1:o=0`
        }],
        [{
          text: buttons.back,
          callback_data: 'p=1:o=0'
        }]
      ]
      return ctx.reply(messageText, {
        reply_markup: {
          inline_keyboard: keyboard
        },
        parse_mode: 'HTML'
      })
    } else if (/query:[\S\s]+/i.test(text)) {
      const query = text.match(/query:([\S\s])+/i)[1]
      const result = await keyboardPage(query)
      return ctx.reply(result.message, result.extra)
    } else if (/magnet:[0-9]+/i.test(text)) {
      const id = text.match(/magnet:([0-9]+)/i)[1]
      const view = await getView(id)
      const searchUrl = `https://nyaa.si/`
      const messageText = `<a href="${searchUrl}">&#160;</a>${view.title}\n<code>${view.links.magnet}</code>`
      return ctx.reply(messageText, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
        reply_markup: {
          inline_keyboard: [
            [{
              text: buttons.back,
              callback_data: `v=${id}:p=1:o=0`
            }]
          ]
        }
      })
    }
  }
  ctx.reply('I\'m nyaa.si website bot and i can help you to find some content from there.\nJust use command /index or /search <text to search> and i\'ll found it on nyaa.si')
})
