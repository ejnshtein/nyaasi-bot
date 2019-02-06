const RssParser = require('rss-parser')
const { buffer } = require('../lib')
const { scheduleJob } = require('node-schedule')
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
const sleep = timeout => new Promise(resolve => setTimeout(resolve, timeout))

const feed = {
  items: [],
  feedUrl: 'https://nyaa.si/?page=rss',
  title: 'Nyaa - Home - Torrent File RSS',
  description: 'RSS Feed for Home',
  link: 'https://nyaa.si/'
};

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

module.exports = bot => {
  const { telegram } = bot

  scheduleJob('*/1 * * * *', async () => {
    const newFeed = await loadFeed()
    const newPosts = newFeed.items.filter(el => !feed.items.some(p => p.id === el.id)).reverse()
    feed.items = newFeed.items
    if (newPosts.length) {
      for (const post of newPosts) {
        await sendMessage(post)
        await sleep(1500)
      }
    }
  })

  async function sendMessage (post) {
    let messageText = `<b>${post.title}</b>\n`
    messageText += `${post['nyaa:size']} | <a href="${post.link}">Download</a> | <a href="${post.guid}">View</a>\n`
    messageText += `#c${post['nyaa:categoryId']} <a href="https://nyaa.si/?c=${post['nyaa:categoryId']}">${post['nyaa:category']}</a>`
    await telegram.sendMessage(process.env.CHANNEL_ID, messageText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [{
            text: 'Open view',
            url: `https://t.me/${bot.options.username}?start=${buffer.encode(`view:${post.id}`)}`
          }]
        ]
      },
      disable_web_page_preview: true
    })
  }
}
