const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate } = require('../middlewares')
const { torrentView } = require('../generators')

const regexp = new RegExp(`${process.env.HOST.replace(/\./ig, '\\.')}\\/view\\/([0-9]+)`, 'i')

composer.url(regexp,
  Composer.branch(onlyPrivate,
    async ctx => {
      try {
        var { extra, text } = await torrentView(ctx.match[1])
      } catch (e) {
        return ctx.reply(`Something went wrong...\n\n${e.message}`)
      }
      ctx.reply(text, extra)
    }, async ctx => {
      try {
        var { extra, text } = await torrentView(ctx.match[1], undefined, undefined, true, ctx.me)
      } catch (e) {
        return ctx.reply(`Something went wrong...\n\n${e.message}`)
      }
      ctx.reply(text, extra)
    })
)

module.exports = app => {
  app.use(composer.middleware())
}
