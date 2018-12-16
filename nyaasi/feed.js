const RssParser = require('rss-parser')
const { scheduleJob } = require('node-schedule')
const { date: formateDate } = require('../template')
const buttons = require('../buttons')
const { parseURL } = new RssParser({
  customFields: {
    item: [
      'nyaa:seeders',
      'nyaa:leechers',
      '<nyaa:downloads',
      'nyaa:infoHash',
      'nyaa:categoryId',
      'nyaa:category',
      'nyaa:size',
      'description',
      'guid'
    ]
  }
})
const { bot } = require('../bot')
const { telegram } = bot

const feed = {
  items: [],
  feedUrl: 'https://nyaa.si/?page=rss',
  title: 'Nyaa - Home - Torrent File RSS',
  description: 'RSS Feed for Home',
  link: 'https://nyaa.si/'
}

scheduleJob('*/2 * * * *', async () => {
  const newFeed = await loadFeed()
  const newPosts = newFeed.items.filter(el => !feed.items.some(p => p.id === el.id))
  if (newPosts.length) {
    for (const post of newPosts) {
      await sendMessage(post)
      await sleep(1500)
    }
  }
  feed.items = newFeed.items
});

(async () => {
  const data = await loadFeed()
  feed.items = data.items
})()

async function loadFeed () {
  const data = await parseURL('https://nyaa.si/?page=rss')
  data.items.forEach(el => {
    el.id = Number.parseInt(el.guid.match(/view\/([0-9]+)$/i)[1])
  })
  return data
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))
const sendMessage = async post => {
  let messageText = `<a href="${post.guid}">${post.title}</a>\n`
  messageText += `${post['nyaa:size']} · ${formateDate(new Date(post.isoDate))} · ⬆️ ${post['nyaa:seeders']} · ⬇️ ${post['nyaa:leechers']}\n`
  messageText += `<a href="https://nyaa.si?c=${post['nyaa:categoryId']}">${post['nyaa:category']}</a>`
  await telegram.sendMessage('@nyaasi', messageText, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{
          text: buttons.torrent.magnet,
          url: `https://t.me/${bot.options.username}?start=${Buffer.from(`magnet:${post.id}`).toString('base64')}`
        }, {
          text: buttons.torrent.download,
          url: `https://t.me/${bot.options.username}?start=${Buffer.from(`download:${post.id}`).toString('base64')}`
        }, {
          text: 'Full view',
          url: `https://t.me/${bot.options.username}?start=${Buffer.from(`view:${post.id}`).toString('base64')}`
        }]
      ]
    }
  })
}
