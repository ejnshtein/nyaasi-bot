const Composer = require('telegraf/composer')
const composer = new Composer()
const { AllHtmlEntities } = require('html-entities')
const { buttons, templates, buffer } = require('../lib')
const { decode } = new AllHtmlEntities()
const { getTorrent, search } = require('../nyaasi')

composer.inlineQuery(/^torrent:([0-9]+)$/i, async ({ match, me, inlineQuery, answerInlineQuery }) => {
  if (inlineQuery.offset && inlineQuery.offset === '1') { return answerInlineQuery([], queryOptions()) }
  const torrentId = match[1]
  try {
    var torrent = await getTorrent(torrentId)
  } catch (e) {
    return answerInlineQuery(sendError(e), queryOptions())
  }
  torrent.id = torrentId
  try {
    await answerInlineQuery(
      [
        inlineTorrent(torrent, me)
      ],
      queryOptions(`Open this torrent`, match[0])
    )
  } catch (e) {
    return answerInlineQuery(sendError(e), queryOptions())
  }
})

composer.on('inline_query', async ctx => {
  const { query } = ctx.inlineQuery
  let { offset } = ctx.inlineQuery
  if (offset && offset === '1') {
    return ctx.answerInlineQuery([], queryOptions(undefined, query))
  }
  offset = offset ? Number.parseInt(offset) : 1
  const page = offset ? Math.floor(offset / 75) + 1 : 1
  try {
    var response = await search(query, { p: page })
    // var response = await searchKeyboard.inlineMode(query, {
    //   page,
    //   offset: offset % 75
    // })
  } catch (e) {
    return ctx.answerInlineQuery(sendError(e), queryOptions())
  }
  const results = response
    .slice(offset % 75, offset % 75 + 25)
    .map(torrent => inlineTorrent(torrent, ctx.me))
  ctx.answerInlineQuery(
    results,
    queryOptions(undefined, query, `${results.length === 25 ? offset + 25 : 1}`)
  )
})

module.exports = app => {
  app.use(composer.middleware())
}

function inlineTorrent (torrent, me) {
  return {
    type: 'article',
    id: torrent.id.toString(),
    title: decode(torrent.title),
    description: `${torrent.fileSize} · ${templates.date(new Date(Number.parseInt(torrent.timestamp) * 1000))} · ⬆️ ${torrent.seeders} · ⬇️ ${torrent.leechers} · ☑️ ${torrent.completed}`,
    input_message_content: {
      message_text: templates.torrent.inlineQuery(torrent),
      disable_web_page_preview: false,
      parse_mode: 'HTML'
    },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: buttons.torrent.magnet,
            url: `https://t.me/${me}?start=${buffer.encode(`magnet:${torrent.id}`)}`
          }, {
            text: buttons.torrent.download,
            url: `https://t.me/${me}?start=${buffer.encode(`download:${torrent.id}`)}`
          }, {
            text: 'Full view',
            url: `https://t.me/${me}?start=${buffer.encode(`view:${torrent.id}`)}`
          }
        ]
      ]
    }
  }
}

function sendError (error) {
  console.log(error)
  return [
    {
      type: 'article',
      id: '1',
      title: 'Error!',
      description: 'Something went wrong. Try again later, or change request query.',
      input_message_content: {
        message_text: `Error!\n\nSomething went wrong. Try again later, or change request query.`
      }
    }
  ]
}

function queryOptions (switchPmText = 'Continue searching...', query = '', offset = '1', cacheTime = 5, isPersonal = false) {
  return Object.assign({},
    switchPmText ? {
      switch_pm_text: switchPmText,
      switch_pm_parameter: `${buffer.encode(`query:${query.substr(0, 64)}`)}`
    } : {},
    offset ? {
      next_offset: offset
    } : {},
    cacheTime ? {
      cache_time: cacheTime
    } : {},
    isPersonal ? {
      is_personal: isPersonal
    } : {})
}
