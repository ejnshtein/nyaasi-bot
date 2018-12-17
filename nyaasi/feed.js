const RssParser = require('rss-parser')
const { scheduleJob } = require('node-schedule')
const { date: formateDate } = require('../template')
const buttons = require('../buttons')
const { parseURL } = new RssParser({
  customFields: {
    item: [
      'nyaa:seeders',
      'nyaa:leechers',
      'nyaa:downloads',
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

const job = scheduleJob('*/1 * * * *', async () => {
  const newFeed = await loadFeed()
  const newPosts = newFeed.items.filter(el => !feed.items.some(p => p.id === el.id)).reverse()
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
    el.id = Number.parseInt(el.guid.split('/').pop())
  })
  return data
}

const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))
const sendMessage = async post => {
  let messageText = `<b>${post.title}</b>\n`
  messageText += `${post['nyaa:size']} | <a href="${post.link}">Download</a> | <a href="${post.guid}">View</a>\n`
  await telegram.sendMessage('@nyaasi', messageText, {
    parse_mode: 'HTML',
    reply_markup: {
      inline_keyboard: [
        [{
          text: 'Open view',
          url: `https://t.me/${bot.options.username}?start=${Buffer.from(`view:${post.id}`).toString('base64')}`
        }]
      ]
    },
    disable_web_page_preview: true
  })
}
