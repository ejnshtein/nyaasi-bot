require('../env')
const RssParser = require('rss-parser')
const { buffer, buttons } = require('../lib')
const { scheduleJob } = require('node-schedule')
const { AllHtmlEntities } = require('html-entities')
const { decode } = new AllHtmlEntities()
const parser = new RssParser({
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
  feedUrl: `https://${process.env.HOST}/?page=rss`,
  title: `${process.env.WEBSITE_NAME} - Home - Torrent File RSS`,
  description: 'RSS Feed for Home',
  link: `https://${process.env.HOST}/`
};

(async () => {
  const data = await loadFeed()
  feed.items = data.items.map(el => el.id)
})()

async function loadFeed () {
  const data = await parser.parseURL(`https://${process.env.HOST}/?page=rss`)
  data.items.forEach(el => {
    el.id = Number.parseInt(el.guid.split('/').pop())
  })
  return data
}

module.exports = bot => {
  const { telegram } = bot

  scheduleJob('*/1 * * * *', async () => {
    const newFeed = await loadFeed()
    const newPosts = newFeed.items.filter(el => !feed.items.includes(el.id)).reverse()
    feed.items = newFeed.items.map(el => el.id)
    if (newPosts.length) {
      for (const post of newPosts) {
        await sendMessage(post)
        await sleep(1500)
      }
    }
  })

  async function sendMessage (post) {
    let messageText = `<b>${decode(post.title)
      .replace(/</gi, '&lt;')
      .replace(/>/gi, '&gt;')
      .replace(/&/gi, '&amp;')}</b>\n`
    messageText += `${post['nyaa:size']} | <a href="${post.link}">Download</a> | <a href="${post.guid}">View</a>\n`
    messageText += `#c${post['nyaa:categoryId']} <a href="https://${process.env.HOST}/?c=${post['nyaa:categoryId']}">${post['nyaa:category']}</a>`
    await telegram.sendMessage(process.env.CHANNEL_ID, messageText, {
      parse_mode: 'HTML',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: buttons.torrent.magnet,
              url: `${process.env.MAGNET_REDIRECT_HOST}/nyaamagnet/urn:btih:${post['nyaa:infoHash']}`
            },
            {
              text: 'Torrent info',
              url: `https://t.me/${bot.options.username}?start=${buffer.encode(`view:${post.id}`)}`
            }
          ]
        ]
      },
      disable_web_page_preview: true
    })
  }
}
