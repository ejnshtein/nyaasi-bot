import HtmlEntities from 'html-entities'
import env from '../env.js'
const { AllHtmlEntities } = HtmlEntities
const { decode } = new AllHtmlEntities()
export const templates = {
  updated: () => `🗘 Updated ${templates.date()}`,
  searchText: (url, query, page, offset) => {
    let messageText = `<a href='${url}'>${url}</a>\n\n`
    messageText += `${query ? `Search keyword: ${query
      .replace(/</gi, '&lt;')
      .replace(/>/gi, '&gt;')
      .replace(/&/gi, '&amp;')}\n` : ''}`
    messageText += `<b>Page:</b> ${page}\n`
    messageText += `<b>Offset:</b> ${offset}\n\n`
    messageText += `<b>${templates.updated()}</b>`
    messageText += `<a href='${url}'>&#8203;</a>`
    return messageText
  },
  date: (date = new Date()) => `${date.toISOString().replace(/-/ig, '.').replace('T', ' ').slice(0, 19)}`,
  torrent: {
    view (torrentId, torrent, url) {
      let messageText = `<a href='https://${env.HOST}/view/${torrentId}'>${
        decode(torrent.title)
          .replace(/</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/gi, '&amp;')
      }</a>\n`
      if (torrent.entry) {
        messageText += `<b>Torrent entry:</b> <a href='https://${env.HOST}/help#torrent-colors'>${torrent.entry}</a>\n`
      }
      messageText += `<b>Submitter:</b> ${typeof torrent.submitter === 'string' ? torrent.submitter : `<a href='${torrent.submitter.link}'>${torrent.submitter.name}</a>`}\n`
      messageText += `<b>Info:</b> ${torrent.info}\n`
      messageText += `${torrent.file_size} · ${templates.date(new Date(torrent.timestamp))} · ⬆️ ${torrent.stats.seeders} · ⬇️ ${torrent.stats.leechers} · ☑️ ${torrent.stats.downloaded}\n`
      messageText += `<b>Hash:</b> <code>${torrent.info_hash}</code>\n\n`
      messageText += `<a href='${torrent.links.torrent}'>Download Torrent</a>\n\n`
      messageText += `<b>Updated: ${templates.date()}</b><a href='${url}'>&#8203;</a>`
      return messageText
    },
    filesView (torrent, offset, url) {
      let messageText = `<a href='https://${env.HOST}/view/${torrent.id}'>${
        decode(torrent.title)
          .replace(/</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/gi, '&amp;')
      }</a>\n`

      messageText += `<b>Files:</b> ${torrent.files.length}\n`
      messageText += `<b>Current offset:</b> ${offset}\n`
      messageText += `<a href="${url}">&#8203;</a>`

      return messageText
    },
    inlineQuery (torrent) {
      let messageText = `<a href='https://${env.HOST}/view/${torrent.id}'>${
        decode(torrent.title)
          .replace(/</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/gi, '&amp;')
      }</a>\n`
      messageText += `${torrent.fileSize} · ${templates.date(new Date(torrent.timestamp))} · ⬆️ ${torrent.stats.seeders} · ⬇️ ${torrent.stats.leechers} · ☑️ ${torrent.stats.downloaded}\n`
      messageText += `#c${Array.isArray(torrent.category) ? torrent.category[1].code : torrent.category.code} ${Array.isArray(torrent.category) ? torrent.category.map(el => `<a href='https://${process.env.HOST}/?c=${el.code}'>${el.title}</a>`).join(' - ') : `<a href='https://${process.env.HOST}/?c=${torrent.category.code}'>${torrent.category.label}</a>`}`
      return messageText
    }
  },
  error: e => `Something went wrong...\n\n${e.message}`
}
