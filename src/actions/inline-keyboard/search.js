import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import { loadSearchParams } from '../../lib/index.js'
import searchTorrent from '../../views/inline-keyboard/torrent-search.js'
const composer = new Composer()

composer.action(/^p=(\S+):o=(\S+)$/ig, async ctx => {
  const page = Number.parseInt(ctx.match[1])
  const offset = Number.parseInt(ctx.match[2])
  const { value } = loadSearchParams(ctx.callbackQuery.message, page, offset)
  try {
    const { text, extra } = await searchTorrent(value, page, offset)
    await ctx.answerCbQuery('')
    return ctx.editMessageText(text, extra)
  } catch (e) {
    return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
  }
})

bot.use(composer.middleware())
