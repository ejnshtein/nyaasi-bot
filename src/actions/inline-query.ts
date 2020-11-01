import { Composer, TelegrafContext } from 'telegraf'
import { Nyaa } from '@ejnshtein/nyaasi'
import { queryOptions } from '@lib/query-option.js'
import { bot } from '@src/bot'
import { sendError } from './inline-query/send-error'
import { inlineTorrent } from '@lib/inline-torrent'

const composer = new Composer<TelegrafContext>()

composer.on('inline_query', async (ctx) => {
  const { query } = ctx.inlineQuery
  const offset = Number.parseInt(ctx.inlineQuery.offset) || 0

  if (offset && offset === 0) {
    return ctx.answerInlineQuery([], queryOptions())
  }

  const page = offset ? Math.floor(offset / 75) + 1 : 1
  try {
    const { files, current_page, last_page } = await Nyaa.search(
      query,
      undefined,
      {
        params: {
          p: page
        },
        baseUrl: `https://${process.env.HOST}`
      }
    )
    if (last_page < current_page) {
      return ctx.answerInlineQuery([], queryOptions())
    }
    const results = files
      .slice(offset % 75, (offset % 75) + 25)
      .map((torrent) => inlineTorrent(torrent, ctx.me))

    await ctx.answerInlineQuery(
      results,
      queryOptions({
        offset: `${results.length === 25 ? offset + 25 : 0}`
      })
    )
  } catch (e) {
    return ctx.answerInlineQuery([sendError(e)], queryOptions())
  }
})

bot.use(composer.middleware())
