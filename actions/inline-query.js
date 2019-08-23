const Composer = require('telegraf/composer')
const composer = new Composer()
const { AllHtmlEntities } = require('html-entities')
const { buttons, templates, buffer, getXtFromMagnet } = require('../lib')
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
  if (offset && offset === '0') {
    return ctx.answerInlineQuery([], queryOptions(undefined, query))
  }
  offset = offset ? Number.parseInt(offset) : 0
  const page = offset ? Math.floor(offset / 75) + 1 : 1
  try {
    var { files: response, current_page, last_page } = await search(query, { params: { p: page } })
  } catch (e) {
    return ctx.answerInlineQuery(sendError(e), queryOptions())
  }
  // console.log(page, offset, last_page, current_page)
  if (last_page < current_page) {
    return ctx.answerInlineQuery([], queryOptions(undefined, query))
  }
  const results = response
    .slice(offset % 75, offset % 75 + 25)
    .map(torrent => inlineTorrent(torrent, ctx.me))
  try {
    await ctx.answerInlineQuery(
      results,
      queryOptions(
        undefined,
        query,
        `${results.length === 25 ? offset + 25 : 0}`
      )
    )
  } catch (e) {
    return ctx.answerInlineQuery(sendError(e), queryOptions(undefined, undefined, '0'))
  }
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
            url: `${process.env.MAGNET_REDIRECT_HOST}/nyaamagnet/${getXtFromMagnet(torrent.links.magnet)}`
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
      description: `Something went wrong... ${error.message}`,
      input_message_content: {
        message_text: `Something went wrong... ${error.message}`
      }
    }
  ]
}

function queryOptions (switchPmText = 'Continue searching...', query = '', offset = '1', cacheTime = 5, isPersonal = false) {
  return Object.assign({},
    switchPmText ? {
      switch_pm_text: switchPmText,
      switch_pm_parameter: `${buffer.encode(`query:${query.substr(0, 40)}`)}`
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
