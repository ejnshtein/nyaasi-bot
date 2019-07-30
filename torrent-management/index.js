if (!process.env.REDIS_URL) {
  return
}

const Queue = require('bee-queue')
const { Telegram } = require('telegraf')
const telegram = new Telegram(process.env.BOT_TOKEN)
const collection = require('../core/database')
const { templates } = require('../lib')

const torrentQueue = new Queue('torrent-queue', {
  redis: {
    url: process.env.REDIS_URL
  },
  removeOnSuccess: true,
  removeOnFailure: true,
  stallInterval: 15000,
  isWorker: false
})

torrentQueue
  .on('job failed', async (jobId, err) => {
    const job = await torrentQueue.getJob(jobId)
    // there could be more err types, so that's why here's an array
    const isFileError = ['Size of some of files is bigger than 1.5gb.'].includes(err.message)
    console.log(`Job failed: ${jobId} `, err)
    telegram.editMessageText(
      job.data.chat.id,
      job.data.message_id,
      undefined,
      `Torrent uploading error: ${err.message}${
        isFileError
          ? ''
          : `\nContact <a href="https://t.me/ejnshtein">admin</a> about this error and forward him this message.\n\n${err.stack}`}`,
      {
        parse_mode: 'HTML'
      }
    )

    collection('torrents').updateOne(
      {
        id: job.data.torrent.id
      }, {
        $set: {
          status: isFileError ? 'fileserror' : 'error',
          status_text: err.message
        }
      }).exec()
  })
  .on('job succeeded', async (jobId, result) => {
    const job = await torrentQueue.getJob(jobId)
    console.log(`Job completed: ${jobId} `, result, job)
    try {
      await collection('torrents').updateOne(
        {
          id: job.data.torrent.id
        }, {
          $set: {
            status: 'uploaded',
            is_finished: true,
            files: result
          }
        }).exec()
    } catch (e) {
      return telegram.editMessageText(
        job.data.chat.id,
        job.data.message_id,
        undefined,
        `Something went wrong...\n\n${e.message}`
      )
    }
    telegram.editMessageText(
      job.data.chat.id,
      job.data.message_id,
      undefined,
      `Torrent uploaded!\nClick "Refresh" button on replied message and good luck!`, {
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
    job.remove()
  })
  .on('job progress', async (jobId, progress) => {
    const job = await torrentQueue.getJob(jobId)
    console.log(`Job progress: ${jobId} - ${progress}%`)
    telegram.editMessageText(
      job.data.chat.id,
      job.data.message_id,
      undefined,
      `Torrent progress: ${progress >= 50 ? `Uploading` : `Downloading`} ${progress >= 50 ? progress + 50 : progress}%\n${templates.date()}`
    )
  })
  .on('ready', () => {
    console.log('download queue is ready...')
  })

module.exports = {
  queue: torrentQueue
}
