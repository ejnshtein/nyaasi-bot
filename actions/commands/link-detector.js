import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'
import torrentView from '../../views/inline-keyboard/torrent-view.js'
import { templates } from '../../lib/index.js'
import env from '../../env.js'

const composer = new Composer()

const regexp = new RegExp(`${env.HOST.replace(/\./ig, '\\.')}\\/view\\/([0-9]+)`, 'i')

composer.url(regexp,
  Composer.branch(
    ctx => ctx.chat && ctx.chat.type === 'private',
    async ctx => {
      try {
        const { extra, text } = await torrentView(ctx.match[1])
        await ctx.reply(text, extra)
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    }, async ctx => {
      try {
        const { extra, text } = await torrentView(ctx.match[1], undefined, undefined, true, ctx.me)
        await ctx.reply(text, extra)
      } catch (e) {
        return ctx.reply(templates.error(e))
      }
    })
)

bot.use(composer.middleware())
