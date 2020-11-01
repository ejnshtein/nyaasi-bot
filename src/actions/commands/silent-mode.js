import { Composer } from '@telegraf/core'
import { bot } from '../../core/bot.js'

const composer = new Composer()

composer.command(
  'silenton',
  Composer.groupChat(
    async ctx => {
      await ctx.db('chats').updateOne(
        { id: ctx.chat.id },
        { $set: { silent_mode: true } }
      )

      return ctx.reply('Done. Silent mode on.')
    }
  )
)

composer.command(
  'silentoff',
  Composer.groupChat(
    async ctx => {
      await ctx.db('chats').updateOne(
        { id: ctx.chat.id },
        { $set: { silent_mode: false } }
      )

      return ctx.reply('Done. Silent mode off.')
    }
  )
)

bot.use(composer.middleware())
