const Composer = require('telegraf/composer')
const composer = new Composer()

composer.action(/^delete$/i, async ctx => {
  try {
    await ctx.deleteMessage()
  } catch (e) {
    return ctx.answerCbQuery('This message too old, you should delete it yourserf.', true)
  }
  return ctx.answerCbQuery('')
})

module.exports = app => {
  app.use(composer.middleware())
}
