/* eslint no-case-declarations: 0, no-empty: 0 */
const Composer = require('telegraf/composer')
const composer = new Composer()
const { buttons, buffer } = require('../lib')
const { torrentView, searchTorrentKeyboard } = require('../generators')
const { getTorrent } = require('../nyaasi')

composer.start(async ctx => {
  if (ctx.startPayload) {
    const text = buffer.decode(ctx.startPayload)
    switch (true) {
      case /download:[0-9]+/i.test(text):
        const torrentId = text.match(/download:([0-9]+)/i)[1]
        try {
          await ctx.replyWithDocument({
            url: `https://nyaa.si/download/${torrentId}.torrent`,
            filename: `${torrentId}.torrent`
          })
          return
        } catch (e) {}
        break
      case /^\b(view|torrent):([0-9]+)$/i.test(text):
        const id = text.match(/^\b(view|torrent):([0-9]+)/i)[2]
        const torrent1 = await torrentView(id, '')
        try {
          await ctx.reply(torrent1.text, torrent1.extra)
          return
        } catch (e) {
          console.log(JSON.stringify(e))
        }
        break
      case /query:[\S\s]+/i.test(text):
        const query = text.match(/query:([\S\s])+/i)[1]
        const result = await searchTorrentKeyboard(query)
        try {
          await ctx.reply(result.text, result.extra)
          return
        } catch (e) {}
        break
      case /magnet:[0-9]+/i.test(text):
        const mid = text.match(/magnet:([0-9]+)/i)[1]
        const torrent = await getTorrent(mid)
        try {
          await ctx.reply(`<a href="https://nyaa.si/">&#8203;</a>${torrent.title}\n<code>${torrent.links.magnet}</code>`, {
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: buttons.back,
                    callback_data: `t=${id}:p=1:o=0`
                  }
                ]
              ]
            }
          })
        } catch (e) {}
        break
    }
  }
  ctx.reply(`I'm nyaa.si website bot and i can help you to find some torrents on nyaa.si right here, in our beautiful Telegram!`, {
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
