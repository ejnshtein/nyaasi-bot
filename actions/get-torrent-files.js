if (!process.env.REDIS_URL) {
  module.exports = app => {}
  return
}

const Composer = require('telegraf/composer')
const composer = new Composer()
const { getTorrent } = require('../nyaasi')
const { onlyPrivate, onlyAllowed } = require('../middlewares')
const torrentManagement = require('../torrent-management')

composer.action(
  /^getfiles=([0-9]+)/i,
  onlyPrivate,
  onlyAllowed,
  async ctx => {
    const { user } = ctx.state
    try {
      var torrent = await getTorrent(ctx.match[1])
    } catch (e) {
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    const message = await ctx.reply('Processing your request...', {
      reply_to_message_id: ctx.callbackQuery.message.message_id
    })
    try {
      var torrentInDb = await ctx.db('torrents').findOne({ id: torrent.id }).exec()
    } catch (e) {
      console.log(e)
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    if (!torrentInDb) {
      try {
        torrentInDb = await ctx.db('torrents').create(torrent)
      } catch (e) {
        console.log(e)
        return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
      }
    }

    // if (torrentInDb.status === 'fileserror') {
    //   return ctx.answerCbQuery(`Sorry, I can't download this torrent because previous attempt to download got that error: ${torrentInDb.status_text}\n\nYou can contact admin for more details...`)
    // }
    ctx.answerCbQuery('')
    try {
      await torrentManagement.queue.createJob({
        from: ctx.from,
        chat: ctx.chat,
        message_id: message.message_id,
        is_admin: user.is_admin,
        torrent: {
          id: torrent.id,
          magnet: torrent.links.magnet
        }
      }, {
        attemps: 2,
        removeOnComplete: true,
        removeOnFail: true
      }).save()
    } catch (e) {
      return ctx.telegram.editMessageText(
        ctx.chat.id,
        message.message_id,
        undefined,
        `Something went wrong...\n${e.message}`
      )
    }
    ctx.telegram.editMessageText(
      ctx.chat.id,
      message.message_id,
      undefined,
      `Torrent added to queue!`
    )
    try {
      torrentInDb.status = 'pending'
      torrentInDb.markModified('status')
      await torrentInDb.save()
    } catch (e) {
      console.log(e)
      return ctx.reply(`Something went wrong...\n\n${e.message}`)
    }
  })

module.exports = app => {
  app.use(composer.middleware())
}
