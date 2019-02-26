const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()
const templates = {
  updated: () => `🗘 Updated ${templates.date(new Date())}`,
  searchText: (url, query, page, offset) => {
    let messageText = `<a href='${url}'>${url}</a>\n\n`
    messageText += `${query ? `Search keyword: ${query}\n` : ''}`
    messageText += `<b>Page:</b> ${page}\n`
    messageText += `<b>Offset:</b> ${offset}\n\n`
    messageText += `<b>${templates.updated()}</b>`
    messageText += `<a href='${url}'>&#8203;</a>`
    return messageText
  },
  date: (date = new Date()) => `${date.toISOString().replace(/-/ig, '.').replace('T', ' ').slice(0, 19)}`,
  torrent: {
    view (torrentId, torrent, url) {
      let messageText = `<a href='https://nyaa.si/view/${torrentId}'>${
        decode(torrent.title)
          .replace(/</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/gi, '&amp;')
      }</a>\n`
      if (torrent.entry) {
        messageText += `<b>Torrent entry:</b> <a href='https://nyaa.si/help#torrent-colors'>${torrent.entry}</a>\n`
      }
      messageText += `<b>Submitter:</b> ${typeof torrent.submitter === 'string' ? torrent.submitter : `<a href='${torrent.submitter.link}'>${torrent.submitter.name}</a>`}\n`
      messageText += `<b>Info:</b> ${torrent.info}\n`
      messageText += `${torrent.fileSize} · ${templates.date(new Date(Number.parseInt(torrent.timestamp) * 1000))} · ⬆️ ${torrent.seeders} · ⬇️ ${torrent.leechers} · ☑️ ${torrent.completed}\n`
      messageText += `<b>Hash:</b> <code>${torrent.infoHash}</code>\n\n`
      messageText += `<a href='${torrent.links.torrent}'>Download Torrent</a>\n\n`
      messageText += `<b>Updated: ${templates.date()}</b><a href='${url}'>&#8203;</a>`
      return messageText
    },
    inlineQuery (torrent) {
      let messageText = `<a href='https://nyaa.si/view/${torrent.id}'>${
        decode(torrent.title)
          .replace(/</gi, '&lt;')
          .replace(/>/gi, '&gt;')
          .replace(/&/gi, '&amp;')
      }</a>\n`
      messageText += `${torrent.fileSize} · ${templates.date(new Date(Number.parseInt(torrent.timestamp) * 1000))} · ⬆️ ${torrent.seeders} · ⬇️ ${torrent.leechers} · ☑️ ${torrent.completed}\n`
      messageText += `#c${Array.isArray(torrent.category) ? torrent.category[1].code : torrent.category.code} ${Array.isArray(torrent.category) ? torrent.category.map(el => `<a href='https://nyaa.si/?c=${el.code}'>${el.title}</a>`).join(' - ') : `<a href='https://nyaa.si/?c=${torrent.category.code}'>${torrent.category.label}</a>`}`
      return messageText
    }
  }
}
module.exports = templates
