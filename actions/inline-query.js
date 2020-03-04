import { Composer } from '@telegraf/core'
import HtmlEntities from 'html-entities'
import { buttons, templates, buffer, getXtFromMagnet } from '../lib/index.js'
import { Nyaa } from '@ejnshtein/nyaasi'
import { bot } from '../core/bot.js'
import env from '../env.js'

const { AllHtmlEntities } = HtmlEntities
const composer = new Composer()
const { decode } = new AllHtmlEntities()

composer.inlineQuery(
  /^torrent:([0-9]+)$/i,
  async ({ match, me, inlineQuery, answerInlineQuery }) => {
    if (inlineQuery.offset && inlineQuery.offset === '1') {
      return answerInlineQuery([], queryOptions())
    }
    const torrentId = match[1]
    try {
      const torrent = await Nyaa.getTorrentAnonymous(torrentId, undefined, { baseUrl: `https://${env.HOST}` })
      await answerInlineQuery(
        [inlineTorrent(torrent, me)],
        queryOptions('Show torrent info', match[0])
      )
    } catch (e) {
      return answerInlineQuery(sendError(e), queryOptions())
    }
  })

composer.on(
  'inline_query', async ctx => {
    const { query } = ctx.inlineQuery
    let { offset } = ctx.inlineQuery
    if (offset && offset === '0') {
      return ctx.answerInlineQuery([], queryOptions(undefined, query))
    }
    offset = offset ? Number.parseInt(offset) : 0
    const page = offset ? Math.floor(offset / 75) + 1 : 1
    try {
      const { files: response, current_page, last_page } = await Nyaa.search(query, undefined, { params: { p: page }, baseUrl: `https://${env.HOST}` })
      if (last_page < current_page) {
        return ctx.answerInlineQuery([], queryOptions(undefined, query))
      }
      const results = response
        .slice(offset % 75, offset % 75 + 25)
        .map(torrent => inlineTorrent(torrent, ctx.me))

      await ctx.answerInlineQuery(
        results,
        queryOptions(
          undefined,
          query,
          `${results.length === 25 ? offset + 25 : 0}`
        )
      )
    } catch (e) {
      return ctx.answerInlineQuery(sendError(e), queryOptions())
    }
  })

bot.use(composer.middleware())

function inlineTorrent (torrent, me) {
  return {
    type: 'article',
    id: torrent.id.toString(),
    title: decode(torrent.name),
    description: `${torrent.file_size} · ${templates.date(new Date(torrent.timestamp))} · ⬆️ ${torrent.stats.seeders} · ⬇️ ${torrent.stats.leechers} · ☑️ ${torrent.stats.downloaded}`,
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
            url: `${env.MAGNET_REDIRECT_HOST}/${env.MAGNET_REDIRECT_PREFIX}/${getXtFromMagnet(torrent.links.magnet)}`
          }, {
            text: buttons.torrent.download,
            url: `https://t.me/${me}?start=${buffer.encode(`download:${torrent.id}`)}`
          }, {
            text: 'Info',
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
