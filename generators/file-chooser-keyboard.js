const { buttons, templates } = require('../lib')
const querystring = require('querystring')
const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()

module.exports = async (db, torrentId, offset = 0, searchUrl) => {
  const torrent = await db('torrents').findOne({ id: torrentId }).exec()
  const keyboard = torrent.files
    .slice(offset, offset + 10)
    .map(file => (
      [
        {
          text: `[${file.id}/${torrent.files.length}] [${file.type}] ${decode(file.caption)}`,
          callback_data: `file:${querystring.stringify({ i: torrentId, f: file.id })}`
        }
      ]
    ))
  if (offset >= 10) {
    if (keyboard.length === 10) {
      keyboard.unshift(
        [
          {
            text: buttons.offset.minus(10),
            callback_data: `files:${querystring.stringify({ i: torrentId, o: offset - 10 })}`
          },
          {
            text: buttons.offset.plus(10),
            callback_data: `files:${querystring.stringify({ i: torrentId, o: offset + 10 })}`
          }
        ]
      )
    } else {
      keyboard.unshift(
        [
          {
            text: buttons.offset.minus(10),
            callback_data: `files:${querystring.stringify({ i: torrentId, o: offset - 10 })}`
          }
        ]
      )
    }
  } else if (keyboard.length === 10) {
    keyboard.unshift(
      [
        {
          text: buttons.offset.plus(10),
          callback_data: `files:${querystring.stringify({ i: torrentId, o: offset + 10 })}`
        }
      ]
    )
  }
  if (torrent.files.length > 1) {
    keyboard.unshift(
      [
        {
          text: 'Get all files (might take a while)',
          callback_data: `filesall:${querystring.stringify({ i: torrentId })}`
        }
      ]
    )
  }
  return {
    text: templates.torrent.filesView(torrent, offset, searchUrl),
    extra: {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: keyboard
      }
    }
  }
}
