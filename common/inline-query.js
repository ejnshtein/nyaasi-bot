const { bot } = require('../core/bot')
const { AllHtmlEntities } = require('html-entities')
const { messageKeyboard } = require('../generators')
const { buttons, templates, buffer } = require('../lib')
const { decode } = new AllHtmlEntities()
bot.on('inline_query', async ctx => {
  const {
    query
  } = ctx.inlineQuery
  let {
    offset
  } = ctx.inlineQuery
  offset = Number.parseInt(offset) || 0

  const page = offset ? Math.floor(offset / 75) + 1 : 1

  const response = await messageKeyboard.inlineMode(query, {
    page,
    offset: offset % 75
  })
  const results = response.map(el => {
    el.timestamp = new Date(el.timestamp * 1000)
    let messageText = `\n<a href="https://nyaa.si${el.links.page}">${decode(el.name)}</a>\n`
    messageText += `${el.fileSize} · ${templates.date(el.timestamp)} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}\n${el.category.label}`
    return {
      type: 'article',
      id: el.id.toString(),
      title: decode(el.name),
      description: `${el.fileSize} · ⬆️ ${el.seeders} · ⬇️ ${el.leechers} · ☑️ ${el.nbDownload}\n${el.category.label}\n${templates.date(el.timestamp)}`,
      input_message_content: {
        message_text: messageText,
        disable_web_page_preview: false,
        parse_mode: 'HTML'
      },
      reply_markup: {
        inline_keyboard: [
          [{
            text: buttons.torrent.magnet,
            url: `https://t.me/${bot.options.username}?start=${buffer.encode(`magnet:${el.id}`)}`
          }, {
            text: buttons.torrent.download,
            url: `https://t.me/${bot.options.username}?start=${buffer.encode(`download:${el.id}`)}`
          }, {
            text: 'Full view',
            url: `https://t.me/${bot.options.username}?start=${buffer.encode(`view:${el.id}`)}`
          }]
        ]
      }
    }
  })
  ctx.answerInlineQuery(results, {
    cache_time: 5,
    switch_pm_text: 'Continue searching...',
    switch_pm_parameter: `${buffer.encode(`query:${query.slice(0, 64)}`)}`,
    next_offset: `${offset + 25}`
  })
})
