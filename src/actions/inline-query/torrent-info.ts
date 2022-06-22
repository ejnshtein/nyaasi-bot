import { Composer } from 'grammy'
import { Nyaa } from '@ejnshtein/nyaasi'
import { bot } from 'src/bot'
import { sendError } from 'actions/inline-query/send-error'
import { inlineTorrent } from 'lib/inline-torrent'
import { queryOptions } from 'lib/query-option'

const composer = new Composer()

composer.inlineQuery(
  /^torrent:([0-9]+)$/i,
  async ({ match, me, inlineQuery, answerInlineQuery }) => {
    if (inlineQuery.offset && inlineQuery.offset === '1') {
      return answerInlineQuery([], queryOptions())
    }
    const torrentId = parseInt(match![1])
    try {
      const torrent = await Nyaa.getTorrentAnonymous(torrentId, undefined, {
        baseUrl: `https://${process.env.HOST}`
      })
      await answerInlineQuery(
        [inlineTorrent(torrent, me.username)],
        queryOptions({ switchPmText: 'Show torrent info', offset: match![0] })
      )
    } catch (e) {
      return answerInlineQuery([sendError(e as Error)], queryOptions())
    }
  }
)

bot.use(composer.middleware())
