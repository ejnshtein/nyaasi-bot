const Composer = require('telegraf/composer')
const composer = new Composer()
const { onlyPrivate, onlyAllowed } = require('../middlewares')
const querystring = require('querystring')
const path = require('path')
const { sendFile, sleep, loadSearchParams } = require('../lib')
const chooseKeyboard = require('../generators/file-chooser-keyboard')

composer.action(
  /file:(.+)/i,
  onlyPrivate,
  onlyAllowed,
  async ctx => {
    const params = querystring.parse(ctx.match[1])
    const torrentId = params['i']
    if (!torrentId) {
      return ctx.answerCbQuery('No torrent id was given')
    }
    const fileId = params['f']
    if (!fileId) {
      return ctx.answerCbQuery('No file id was given')
    }

    try {
      var torrent = await ctx.db('torrents').findOne({ id: Number(torrentId) }).exec()
    } catch (e) {
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }

    if (!torrent) {
      return ctx.answerCbQuery('Torrent not found')
    }

    if (!torrent.is_finished) {
      return ctx.answerCbQuery(`Hmmm, this torrent isn't finished yet...\nI recommend to ask admin about this thing :thinking:`)
    }
    const file = torrent.files.find(file => file.id === Number(fileId))

    if (!file) {
      return ctx.answerCbQuery(`File with given id ${fileId} wasn't found on this torrent`)
    }

    try {
      await sendFile(ctx.chat.id, file, ctx.telegram, {
        caption: `#nyaa${torrentId} ${fileId} of ${torrent.files.length}\n"${file.caption}"`
      })
    } catch (e) {
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    if (torrent.files.length === 1) {
      try {
        await ctx.deleteMessage()
      } catch {}
    }
    ctx.answerCbQuery('')
  }
)

composer.action(
  /files:(.+)/i,
  onlyPrivate,
  onlyAllowed,
  async ctx => {
    const { value } = loadSearchParams(ctx.callbackQuery.message)
    const searchUrl = `https://${process.env.HOST}/?p=${ctx.match[2]}${value ? `&q=${value}` : ''}`
    const params = querystring.parse(ctx.match[1])
    const offset = Number(params['o']) || 0
    const torrentId = Number(params['i'])
    const isNew = params['n']
    if (!torrentId) {
      return ctx.answerCbQuery('No torrent id was given')
    }
    try {
      var { text, extra } = await chooseKeyboard(ctx.db, torrentId, offset, searchUrl)
    } catch (e) {
      console.log(e)
      return ctx.answerCbQuery(`Something went wrong...\n\n${e.message}`, true)
    }
    ctx.answerCbQuery('')
    if (isNew) {
      return ctx.reply(text, extra)
    }
    return ctx.editMessageText(text, extra)
  })

composer.action(
  /filesall:(.+)/i,
  onlyPrivate,
  onlyAllowed,
  async ctx => {
    const params = querystring.parse(ctx.match[1])
    const torrentId = params['i']
    if (!torrentId) {
      return ctx.answerCbQuery('No torrent id was given')
    }
    ctx.answerCbQuery('')
    const torrent = await ctx.db('torrents').findOne({ id: Number(torrentId) }).exec()

    if (!torrent) {
      return ctx.answerCbQuery(`Torrent not found`, true)
    }
    if (!torrent.files.length) {
      return ctx.answerCbQuery(`This torrent has no files`, true)
    }

    ctx.answerCbQuery(`Processing ${torrent.files.length} files...`)

    for (const file of torrent.files) {
      try {
        await sendFile(ctx.chat.id, file, ctx.telegram, {
          caption: `#nyaa${torrentId} ${file.id} of ${torrent.files.length}\n"${path.basename(file.caption)}"`
        })
      } catch (e) {
        await ctx.reply(`Something went wrong...\n\n${e.message}`, true)
      }
      await sleep(2000)
    }
    ctx.deleteMessage()
    return ctx.reply(`Files sent`, {
      // reply_to_message_id: ctx.callbackQuery.message.message_id,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Ok',
              callback_data: 'delete'
            }
          ]
        ]
      }
    })
  }
)
module.exports = app => {
  app.use(composer.middleware())
}
