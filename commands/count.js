const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')

composer.command('count', onlyPrivate, async ctx => {
  if (ctx.from.id === Number.parseInt(process.env.ADMIN_ID)) { // optional
    const usersCount = await ctx.db('users').find().estimatedDocumentCount().exec()
    ctx.reply(`I'm working for ${usersCount} user(s)!`)
  }
})

module.exports = app => {
  app.use(composer.middleware())
}
