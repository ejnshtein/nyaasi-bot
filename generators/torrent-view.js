import { Nyaa } from '@ejnshtein/nyaasi'
import { templates, buttons, buffer, getXtFromMagnet, argv } from '../lib/index.js'
import collection from '../core/database/index.js'
import { stringify } from 'querystring'

export default async (id, query = '', history = 'p=1:o=0', publicMessage = false, me, allowGetFiles = false, canDownloadTorrent = false) => {
  const torrent = await Nyaa.getTorrentAnonymous(id)
  const DbTorrent = await collection('torrents').findOne({ id: torrent.id })
  const keyboard = publicMessage ? [
    [
      {
        text: buttons.torrent.download,
        url: `https://t.me/${me}?start=${buffer.encode(`download:${id}`)}`
      }, {
        text: buttons.torrent.magnet,
        url: `${env.MAGNET_REDIRECT_HOST}/${env.MAGNET_REDIRECT_PREFIX}/${getXtFromMagnet(torrent.links.magnet)}`
      },
      {
        text: 'Full view',
        url: `https://t.me/${me}?start=${buffer.encode(`view:${id}`)}`
      }
    ]
  ] : [
    [
      {
        text: buttons.torrent.download,
        callback_data: `d=${id}`
      }, {
        text: buttons.torrent.magnet,
        url: `${process.env.MAGNET_REDIRECT_HOST}/${process.env.MAGNET_REDIRECT_PREFIX}/${getXtFromMagnet(torrent.links.magnet)}`
      },
      {
        text: buttons.share,
        switch_inline_query: `torrent:${id}`
      }
    ],
    [
      {
        text: buttons.back,
        callback_data: history
      },
      {
        text: buttons.page.refresh,
        callback_data: `t=${id}:${history}`
      }
    ]
  ]
  if (argv('-torrents')) {
    if (allowGetFiles) {
      if (canDownloadTorrent) {
        keyboard.push(
          [
            {
              text: DbTorrent && DbTorrent.status === 'uploaded' ? 'Get Files' : 'Download files to Telegram',
              callback_data: DbTorrent && DbTorrent.status === 'uploaded'
                ? `files:${stringify({ i: id, n: 1 })}`
                : `getfiles=${id}`
            }
          ]
        )
      } else if (DbTorrent && DbTorrent.status === 'uploaded') {
        keyboard.push(
          [
            {
              text: 'Get Files',
              callback_data: `files:${stringify({ i: id, n: 1 })}`
            }
          ]
        )
      }
    }
  }
  return {
    torrent,
    text: publicMessage
      ? templates.torrent.inlineQuery(torrent)
      : templates.torrent.view(
        id,
        torrent,
        `https://${process.env.HOST}/?q=${query}`
      ),
    extra: {
      reply_markup: {
        inline_keyboard: keyboard
      },
      parse_mode: 'HTML'
    }
  }
}

// function countFiles (torrent) {
//   let fileCount = 0
//   torrent.files.forEach(count)
//   function count (file) {
//     if (file.type === 'file') {
//       ++fileCount
//     } else {
//       file.folder.forEach(count)
//     }
//   }
//   return fileCount
// }

// function getFile (torrent) {
//   let fileData
//   torrent.files.forEach(get)
//   function get (file) {
//     if (file.type === 'file') {
//       fileData = file
//     } else {
//       file.folder.forEach(get)
//     }
//   }
//   return fileData
// }
