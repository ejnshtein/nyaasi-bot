import { InlineQueryResultArticle } from 'telegraf/typings/telegram-types'
import { SearchFile, ViewTorrent } from '@ejnshtein/nyaasi'
import { AllHtmlEntities } from 'html-entities'

import { templates } from '@lib/templates'
import buttons from '@lib/buttons'
import buffer from '@lib/buffer'
import { getMagnetHash } from '@lib/get-magnet-hash'

const { decode } = new AllHtmlEntities()

export const inlineTorrent = (
  torrent: ViewTorrent | SearchFile,
  me: string
): InlineQueryResultArticle => {
  return {
    type: 'article',
    id: torrent.id.toString(),
    title: decode(torrent.name),
    description: `${torrent.file_size} · ${templates.date(
      new Date(torrent.timestamp)
    )} · ⬆️ ${torrent.stats.seeders} · ⬇️ ${torrent.stats.leechers} · ☑️ ${
      torrent.stats.downloaded
    }`,
    input_message_content: {
      message_text: templates.torrent.inlineQuery(torrent),
      disable_web_page_preview: false,
      parse_mode: 'HTML'
    },
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: buttons.torrent.magnet,
            url: `${process.env.MAGNET_REDIRECT_HOST}/${
              process.env.MAGNET_REDIRECT_PREFIX
            }/${getMagnetHash(torrent.links.magnet)}`
          },
          {
            text: buttons.torrent.download,
            url: `https://t.me/${me}?start=${buffer.encode(
              `download:${torrent.id}`
            )}`
          },
          {
            text: 'Info',
            url: `https://t.me/${me}?start=${buffer.encode(
              `view:${torrent.id}`
            )}`
          }
        ]
      ]
    }
  }
}
