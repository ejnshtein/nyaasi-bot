require('./env')
const { bot } = require('./core/bot')
require('./actions')(bot)
require('./commands')(bot)
require('./nyaasi/feed')(bot)

process.on('unhandledRejection', (res, promise) => {
  console.log(res, promise)
})
