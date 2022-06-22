import { Composer } from 'grammy'
import { bot } from 'src/bot'
import { onlyGroup } from 'src/middlewares/only-group'

const composer = new Composer()

composer
  .filter(onlyGroup)
  .command('sileton', async (ctx) => {
    await ctx
      .db('chats')
      .updateOne({ id: ctx.chat.id }, { $set: { silent_mode: true } })

    return ctx.reply('Done. Silent mode on.')
  })
  .command('silentof', async (ctx) => {
    await ctx
      .db('chats')
      .updateOne({ id: ctx.chat.id }, { $set: { silent_mode: false } })

    return ctx.reply('Done. Silent mode off.')
  })

// composer.command('silenton', Composer.groupChat())

// composer.command('silentoff', Composer.groupChat())

bot.use(composer.middleware())
