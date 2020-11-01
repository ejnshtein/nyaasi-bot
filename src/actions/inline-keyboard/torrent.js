import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import { loadSearchParams, templates } from '../../lib/index.js'
import viewTorrent from '../../views/inline-keyboard/torrent-view.js'
const composer = new Composer()

composer.action([
  /^v=(\S+?):(\S+)$/i,
  /^t=(\S+?):(\S+)$/i
], async ctx => {
  const { value } = loadSearchParams(ctx.callbackQuery.message)
  const { user } = ctx.state
  try {
    const { text, extra } = await viewTorrent(
      ctx.match[1],
      value,
      ctx.match[2],
      undefined,
      undefined,
      user.allow_get_torrent_files,
      user.allow_torrent_download
    )
    await ctx.answerCbQuery('')
    return ctx.editMessageText(text, extra)
  } catch (e) {
    return ctx.answerCbQuery(templates.error(e), true)
  }
})

bot.use(composer.middleware())
