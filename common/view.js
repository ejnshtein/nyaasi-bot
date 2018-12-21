const { bot } = require('../core/bot')
const { view } = require('../generators')
const { getView } = require('../nyaasi')
const { buttons, getUrlParam } = require('../lib')

bot.action(/^v=(\S+?):p=(\S+):o=(\S+)$/ig, async ctx => {
  ctx.answerCbQuery('')
  const query = getUrlParam('q', ctx.callbackQuery.message)
  const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
  const messageText = await view(ctx.match[1], searchUrl)
  const keyboard = [
    [{
      text: buttons.torrent.download,
      callback_data: `d=${ctx.match[1]}`
    }, {
      text: buttons.torrent.magnet,
      callback_data: `magnet=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
    }],
    [{
      text: buttons.page.refresh,
      callback_data: ctx.match[0]
    }],
    [{
      text: buttons.back,
      callback_data: `p=${ctx.match[2]}:o=${ctx.match[3]}`
    }]
  ]
  ctx.editMessageText(messageText, {
    reply_markup: {
      inline_keyboard: keyboard
    },
    parse_mode: 'HTML'
  })
})

bot.action(/download:(\S+);/, (ctx) => {
  ctx.answerCbQuery('')
  ctx.replyWithDocument({
    url: `https://nyaa.si/download/${ctx.match[1]}.torrent`,
    filename: ctx.match[1] + '.torrent'
  })
})

bot.action(/d=(\S+)/, (ctx) => {
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

bot.action(/^magnet=([0-9]+):p=(\S+):o=(\S+)/i, async ctx => {
  ctx.answerCbQuery('')
  const query = getUrlParam('q', ctx.callbackQuery.message)
  const searchUrl = `https://nyaa.si/?p=${ctx.match[2]}${query ? `&q=${query}` : ''}`
  const view = await getView(ctx.match[1])
  let messageText = `<a href="${searchUrl}">&#160;</a>${view.title}\n`
  messageText += `<code>${view.links.magnet}</code>`
  ctx.editMessageText(messageText, {
    parse_mode: 'HTML',
    disable_web_page_preview: true,
    reply_markup: {
      inline_keyboard: [
        [{
          text: buttons.back,
          callback_data: `v=${ctx.match[1]}:p=${ctx.match[2]}:o=${ctx.match[3]}`
        }]
      ]
    },
    reply_to_message_id: ctx.callbackQuery.message.message_id
  })
})
