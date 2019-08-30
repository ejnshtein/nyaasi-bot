const Composer = require('telegraf/composer')
const path = require('path')
const composer = new Composer()
const { buttons, buffer, sendFile } = require('../lib')
const { torrentView, searchTorrentView } = require('../generators')
const { getTorrent } = require('../nyaasi')
const { onlyPrivate } = require('../middlewares')

class StartHandler {
  constructor (ctx) {
    this.ctx = ctx
  }

  async download (id) {
    await this.ctx.replyWithDocument({
      url: `https://${process.env.HOST}/download/${id}.torrent`,
      filename: `${id}.torrent`
    })
  }

  async view (id) {
    const torrent1 = await torrentView(id, '')
    await this.ctx.reply(torrent1.text, torrent1.extra)
  }

  async query (query) {
    const result = await searchTorrentView(query)
    await this.ctx.reply(result.text, result.extra)
  }

  async magnet (id) {
    const torrent = await getTorrent(id)
    await this.ctx.reply(`<a href="https://${process.env.HOST}/">&#8203;</a>${torrent.title}\n<code>${torrent.links.magnet}</code>`, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: 'Open magnet',
              url: `https://nyaasi.herokuapp.com/magnet/${torrent.links.magnet}`
            }
          ],
          [
            {
              text: buttons.back,
              callback_data: `t=${id}:p=1:o=0`
            }
          ]
        ]
      }
    })
  }

  async file (torrentId, fileId) {
    const dbTorrent = await this.ctx.db('torrents').findOne({ id: torrentId }).exec()
    if (dbTorrent && dbTorrent.files.length) {
      const file = dbTorrent.files.find(file => file.id === fileId)
      if (file) {
        await sendFile(
          this.ctx.chat.id,
          file,
          this.ctx.telegram,
          {
            caption: `#nyaa${torrentId} ${file.id} of ${dbTorrent.files.length}\n"${path.basename(file.caption)}"`,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: 'Torrent view',
                    url: `https://t.me/${this.ctx.me}?start=${buffer.encode(`view:${torrentId}`)}`
                  }
                ]
              ]
            }
          }
        )
      } else {
        await this.ctx.reply('File not found')
      }
    }
  }
}

composer.start(onlyPrivate, async ctx => {
  if (ctx.startPayload) {
    const text = buffer.decode(ctx.startPayload)
    const start = new StartHandler(ctx)
    switch (true) {
      case /download:[0-9]+/i.test(text):
        const torrentId = text.split(':').pop()
        try {
          await start.download(torrentId)
          return 
        } catch (e) {}
        break
      case /^\b(view|torrent):([0-9]+)$/i.test(text):
        const vid = text.split(':').pop()
        try {
          await start.view(vid)
          return 
        } catch (e) {}
        break
      case /query:[\S\s]+/i.test(text):
        const query = text.match(/query:([\S\s])+/i)[1]
        try {
          await start.query(query)
          return 
        } catch (e) {}
        break
      case /magnet:[0-9]+/i.test(text):
        const mid = text.split(':').pop()
        try {
          await start.magnet(mid)
          return 
        } catch (e) {}
        break
      case /file:[0-9]+:[0-9]+/i.test(text):
        const splitted = text.split(':')
        const fileId = splitted.pop()
        const tId = splitted.pop()
        try {
          await start.file(Number(tId), Number(fileId))
        } catch (e) {}
    }
  }
  ctx.reply(`I'm ${process.env.WEBSITE_TITLE} website bot and i can help you to find some torrents on ${process.env.WEBSITE_TITLE} right here, in our beautiful Telegram!`, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: `Let's find some torrents!`,
            switch_inline_query_current_chat: ''
          }
        ]
      ]
    }
  })
})

module.exports = app => {
  app.use(composer.middleware())
}
