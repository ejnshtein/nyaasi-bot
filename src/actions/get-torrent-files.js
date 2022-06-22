const { argv } = require('../lib')

if (!argv('-torrents')) {
  module.exports = (app) => {}
  return
} // else setup code below
const Composer = require('telegraf/composer')
const composer = new Composer()
const { getTorrent } = require('../nyaasi')
const { onlyPrivate, onlyAllowed } = require('../middlewares')
const { addTorrent } = require('../requester')

composer.action(
  /^getfiles=([0-9]+)/i,
  onlyPrivate,
  onlyAllowed,
  async (ctx) => {
    if (!process.env.REDIS_URL) {
      return ctx.answerCbQuery('Sorry, this feature is currently disabled')
    }
    const { user } = ctx.state
    try {
      var torrent = await getTorrent(ctx.match[1])
    } catch (e) {
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    try {
      var torrentInDb = await ctx
        .db('torrents')
        .findOne({ id: torrent.id })
        .exec()
    } catch (e) {
      console.log(e)
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    if (!torrentInDb) {
      try {
        torrentInDb = await ctx.db('torrents').create(torrent)
      } catch (e) {
        console.log(e)
        return ctx.answerCbQuery(
          `Something went wrong...\n\n${e.message}`,
          true
        )
      }
    }

    if (torrentInDb.files && torrentInDb.files.length) {
      return ctx.answerCbQuery(
        'Click "Refresh" and then "Get Files" to get files',
        true
      )
    }

    let msg
    try {
      msg = await addTorrent(
        {
          ...ctx.from,
          is_admin: user.is_admin
        },
        torrent
      )
      if (msg.ok) {
        await ctx
          .db('torrents')
          .updateOne({ id: torrent.id }, { $set: { status: 'pending' } })
          .exec()
      }
    } catch (e) {
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    if (!msg.ok) {
      return ctx.answerCbQuery(msg.message)
    } else {
      await ctx.answerCbQuery('')
    }
    return ctx.reply(msg)
  }
)

module.exports = (app) => {
  app.use(composer.middleware())
}
