const cote = require('cote')({ COTE_DISCOVERY_REDIS_URL: process.env.REDIS_URL })

const { Telegram } = require('telegraf')
const telegram = new Telegram(process.env.BOT_TOKEN)
const collection = require('../core/database')

const torrents = new Map()

new cote.MonitoringTool(5555)

const requester = new cote.Requester({
  name: 'bot',
  requests: ['queueTorrent']
})

const subscriber = new cote.Subscriber({
  name: 'bot',
  subscribesTo: ['torrentStatus', 'torrentDone', 'torrentError']
})

subscriber.on('torrentStatus', async e => {
  if (torrents.has(e.id)) {
    torrents.get(e.id).status = e.type
  } else {
    torrents.set(e.id, {
      worker_id: e.worker,
      torrent: {
        id: e.id
      },
      users: [],
      status: e.type
    })
  }
  const torrent = torrents.get(e.id)
  
  switch (e.type) {
    case 'start':
      let msg
      try {
        msg = await telegram.sendMessage(
          process.env.STORE_CHANNEL_ID,
          `Starting download torrent #nyaa${e.id} by #worker${e.worker}`
        )
        torrent.channel_msg_id = msg.message_id
      } catch {}

      if (torrent.users.length) {
        broadcastMessage(
          torrent.users,
          `You can track torrent progress in the channel: https://t.me/${msg.chat.username ? msg.chat.username : `100${msg.chat.id}`}/${msg.message_id}`
        )
      }
      break
    case 'download':
      try {
        await telegram.editMessageText(
          process.env.STORE_CHANNEL_ID,
          torrent.channel_msg_id,
          undefined,
          `#nyaa${e.id} downloaded ${(e.data).toFixed(2)}% by #worker${e.worker}`
        )
      } catch {}

      break
    case 'upload':
      try {
        await telegram.editMessageText(
          process.env.STORE_CHANNEL_ID,
          torrent.channel_msg_id,
          undefined,
          `#nyaa${e.id} uploaded ${(e.data).toFixed(2)}% by #worker${e.worker}`
        )
      } catch {}

      break
  }
})

subscriber.on('torrentDone', async e => {
  const torrent = torrents.get(e.id)
  torrents.delete(e.id)
  console.log(`Job completed: ${e.id} `, e.files)
  try {
    await collection('torrents').updateOne(
      {
        id: e.id
      }, {
        $set: {
          status: 'uploaded',
          is_finished: true,
          files: e.files
        }
      }).exec()
  } catch (err) {
    return telegram.editMessageText(
      process.env.STORE_CHANNEL_ID,
      torrent.channel_msg_id,
      undefined,
      `#nyaa${e.id} error on #worker${e.worker}:\n\n${err.message}`
    )
  }
  await broadcastMessage(
    torrent.users,
    `Torrent uploaded!`, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Ok!',
              callback_data: 'delete'
            }
          ]
        ]
      }
    }
  )
  try {
    await telegram.deleteMessage(
      process.env.STORE_CHANNEL_ID,
      torrent.channel_msg_id
    )
  } catch {}
})

subscriber.on('torrentError', async e => {
  const torrent = torrents.get(e.id)
  torrents.delete(e.id)
  console.log(`Job failed: ${e.id} `, e.error_message, e.error_stack)
  // there could be more err types, so that's why here's an array
  const isFileError = ['Size of some of files is bigger than 1.5gb.', 'Timeout reached limit'].includes(e.error_message)
  try {
    await telegram.editMessageText(
      process.env.STORE_CHANNEL_ID,
      torrent.channel_msg_id,
      undefined,
      `#nyaa${e.id} uploading error on #worker${e.worker}:\n\n${e.error_message}${
        isFileError
          ? ''
          : `\nContact <a href="https://t.me/ejnshtein">admin</a> about this error or forward him this message.`}`,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }
    )
  } catch {}

  try {
    await telegram.sendMessage(
      process.env.ADMIN_ID,
      `#nyaa${e.id} uploading error on #worker${e.worker}:\n\n${e.error_message}\n\n${e.error_stack}`,
      {
        parse_mode: 'HTML',
        disable_web_page_preview: true
      }
    )
  } catch {}

  return collection('torrents').updateOne(
    {
      id: e.id
    }, {
      $set: {
        status: isFileError ? 'fileserror' : 'error',
        status_text: e.error_message
      }
    }).exec()
})

async function broadcastMessage (users, messageText, ...rest) {
  for (const user of users) {
    try {
      await telegram.sendMessage(
        user.id,
        messageText,
        ...rest
      )
    } catch {}
  }
}

module.exports = {
  addTorrent: async (user, torrent) => {
    if (torrents.has(torrent.id)) {
      let torrentInMap = torrents.get(torrent.id)
      let usersCount = torrentInMap.users.push(user)
      return `Torrent was already queued, ${usersCount - 1} user${usersCount - 1 > 1 ? 's are' : ' is'} waiting.`
    } else {

      let res = await requester.send({
        type: 'queueTorrent',
        torrent: {
          id: torrent.id,
          magnet: torrent.links.magnet
        }
      })
      torrents.set(torrent.id, {
        torrent,
        users: [user],
        worker_id: res.worker
      })
      return `Torrent added to queue, ${res.torrents} torrent${res.torrents > 1 ? 's' : ''} in queue`
    }
  }
}