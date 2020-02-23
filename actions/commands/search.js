import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import searchTorrentView from '../../views/inline-keyboard/torrent-search.js'
import { templates } from '../../lib/index.js'

const composer = new Composer()

composer.hears(
  /\/search ([\s\S]*)/i,
  Composer.privateChat(
    async ({ reply, match }) => {
      try {
        const { text, extra } = await searchTorrentView(match[1])
        await reply(text, extra)
      } catch (e) {
        return reply(templates.error(e))
      }
    })
)

composer.command(
  ['index', 'search'],
  Composer.privateChat(
    async ({ reply }) => {
      try {
        const { text, extra } = await searchTorrentView()
        await reply(text, extra)
      } catch (e) {
        return reply(templates.error(e))
      }
    })
)

bot.use(composer.middleware())
