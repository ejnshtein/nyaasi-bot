import { Composer } from 'grammy'
import { templates } from 'lib/templates'
import { bot } from 'src/bot'
import { onlyPrivate } from 'src/middlewares/only-private'

const composer = new Composer()

composer
  .filter(onlyPrivate)
  .hears(/\/search ([\s\S]*)/i, async ({ reply, match }) => {
    try {
      const { text, extra } = await searchTorrentView(match[1])
      await reply(text, extra)
    } catch (e) {
      return reply(templates.error(e))
    }
  })
  .command(['index', 'search'], async ({ reply }) => {
    try {
      const { text, extra } = await searchTorrentView()
      await reply(text, extra)
    } catch (e) {
      return reply(templates.error(e))
    }
  })

// composer.hears(
//   ,
//   Composer.privateChat()
// )

// composer.command(
//   ,
//   Composer.privateChat()
// )

bot.use(composer.middleware())
