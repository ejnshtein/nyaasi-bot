const { bot } = require('../core/bot')
const { collection } = require('../database')

bot.command('count', async (ctx) => {
  if (ctx.from.id === Number.parseInt(process.env.ADMIN_ID)) { // optional
    const usersCount = await collection('users').find().estimatedDocumentCount().exec()
    ctx.reply(`I'm working for ${usersCount} user(s)!`)
  }
})
