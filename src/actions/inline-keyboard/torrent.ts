import { Composer } from 'grammy'
import { loadSearchParams } from 'lib/load-search-params'
import { templates } from 'lib/templates'
import { bot } from 'src/bot'

const composer = new Composer()

// composer.callbackQuery(
//   [/^v=(\S+?):(\S+)$/i, /^t=(\S+?):(\S+)$/i],
//   async (ctx) => {
//     const { value } = loadSearchParams(ctx.callbackQuery.message!)
//     const { user } = ctx.state
//     try {
//       const { text, extra } = await viewTorrent(
//         ctx.match[1],
//         value,
//         ctx.match[2],
//         undefined,
//         undefined,
//         user.allow_get_torrent_files,
//         user.allow_torrent_download
//       )
//       await ctx.answerCallbackQuery('')
//       return ctx.editMessageText(text, extra)
//     } catch (e) {
//       return ctx.answerCallbackQuery(templates.error(e), true)
//     }
//   }
// )

bot.use(composer.middleware())
