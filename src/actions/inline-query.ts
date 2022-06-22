import { Composer } from 'grammy'
import { Nyaa } from '@ejnshtein/nyaasi'
import { queryOptions } from 'lib/query-option.js'
import { bot } from 'src/bot'
import { sendError } from 'actions/inline-query/send-error'
import { inlineTorrent } from 'lib/inline-torrent'

const composer = new Composer()

composer.on('inline_query', async (ctx) => {
  const { query } = ctx.inlineQuery
  const offset = Number.parseInt(ctx.inlineQuery.offset) || 0

  if (offset && offset === 0) {
    return ctx.answerInlineQuery([], queryOptions())
  }

  const page = offset ? Math.floor(offset / 75) + 1 : 1
  try {
    const { torrents, current_page, last_page } = await Nyaa.search(query, {
      params: {
        p: page
      },
      baseUrl: `https://${process.env.HOST}`
    })
    if (last_page < current_page) {
      return ctx.answerInlineQuery([], queryOptions())
    }
    const results = torrents
      .slice(offset % 75, (offset % 75) + 25)
      .map((torrent) => inlineTorrent(torrent, ctx.me.username))

    await ctx.answerInlineQuery(
      results,
      queryOptions({
        offset: `${results.length === 25 ? offset + 25 : 0}`
      })
    )
  } catch (e) {
    if (e instanceof Error) {
      return ctx.answerInlineQuery([sendError(e)], queryOptions())
    }
  }
})

bot.use(composer.middleware())
