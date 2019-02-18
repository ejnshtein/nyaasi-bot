const { getTorrent } = require('../nyaasi')
// const { AllHtmlEntities } = require('html-entities')
// const { decode } = new AllHtmlEntities()
const { templates, buttons, buffer } = require('../lib')
// const collection = require('../core/database')

module.exports = async (id, query = '', history = 'p=1:o=0', publicMessage = false, me) => {
  const torrent = await getTorrent(id)
  // console.log(JSON.stringify(torrent.files))
  let keyboard
  if (publicMessage) {
    keyboard = [
      [
        {
          text: buttons.torrent.download,
          url: `https://t.me/${me}?start=${buffer.encode(`download:${id}`)}`
        }, {
          text: buttons.torrent.magnet,
          url: `https://t.me/${me}?start=${buffer.encode(`magnet:${id}`)}`
        },
        {
          text: 'Full view',
          url: `https://t.me/${me}?start=${buffer.encode(`view:${id}`)}`
        }
      ]
    ]
  } else {
    keyboard = [
      [
        {
          text: buttons.torrent.download,
          callback_data: `d=${id}`
        }, {
          text: buttons.torrent.magnet,
          callback_data: `magnet=${id}:${history}`
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
  }
  // console.log(getFile(torrent))
  // console.log(countFiles(torrent))
  // const downloadedTorrent = await collection('torrents').findOne({ id: torrent.id }).exec()
  // if (downloadedTorrent) {
  //   keyboard.push(
  //     [
  //       {
  //         text: 'Get File',
  //         callback_data: `torrentdownload=${id}:client=bot`
  //       }
  //     ]
  //   )
  // } else if (
  //   torrent.fileSizeBytes - 0.5e7 < 5e7
  //     && countFiles(torrent) === 1
  //     && getFile(torrent) === 'file'
  // ) {
  //   keyboard.push(
  //     [
  //       {
  //         text: 'Download file to Telegram',
  //         callback_data: `torrentdownload=${id}:client=bot`
  //       }
  //     ]
  //   )
  // }
  return {
    torrent,
    text: templates.torrent.view(
      id,
      torrent,
      `https://nyaa.si/?q=${query}`
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
