const Telegram = require('telegraf/telegram')
const sleep = require('./sleep')
const buffer = require('./buffer')
const client = new Telegram(process.env.BOT_TOKEN)
const every = (type, files) => files.every(val => val.type === type)

module.exports = async (chatId, files) => {
  if (files.some(file => file.type === 'photo') && every('photo', files)) {
    try {
      const message = await client.sendMediaGroup(
        chatId,
        files.map(photo => ({
          type: 'photo',
          media: photo.file_id,
          caption: photo.caption
        }))
      )
      return message
    } catch (e) {}
  } else if (files.some(file => file.type === 'video') && every('video', files)) {
    try {
      const message = await client.sendMediaGroup(
        chatId,
        files.map(video => ({
          type: 'video',
          media: video.file_id,
          caption: video.caption
        }))
      )
      return message
    } catch (e) {}
  }

  return sendFiles(chatId, files)
}

async function sendFiles (chatId, files) {
  const messages = []
  for (const file of files) {
    try {
      const message = await sendFile(chatId, file)
      messages.push(message)
    } catch (e) {
      messages.push({
        error: e
      })
    }
    await sleep(1500)
  }
  return messages
}

async function sendFile (chatId, file) {
  switch (file.type) {
    case 'document':
      return client.sendDocument(chatId, file.file_id, {
        caption: file.caption
      })
    case 'video':
      return client.sendVideo(chatId, file.file_id, {
        caption: file.caption
      })
    case 'photo':
      return client.sendPhoto(chatId, file.file_id, {
        caption: file.caption
      })
    case 'audio':
      return client.sendAudio(chatId, file.file_id, {
        caption: file.caption
      })
  }
}
