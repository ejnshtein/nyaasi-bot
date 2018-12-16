const nedb = require('./nedb')
const users = nedb.collection('users')
const admins = nedb.collection('admins')

module.exports = {
  nedb,
  logger () {
    return async ({ updateType, chat, from }, next) => {
      if ((updateType === 'message' && chat.type === 'private') || updateType === 'callback_query') {
        const user = await users.findOne({ id: from.id })
        if (user) {
          await users.update({ id: from.id }, { $set: { activeTime: Date.now() } })
        } else {
          await users.insert({
            id: from.id,
            activeTime: Date.now()
          })
        }
      }
      next()
    }
  },
  middleware () {
    return async (ctx, next) => {
      const admin = await admins.findOne({ id: ctx.from.id })
      if (admin) {
        ctx.local = {
          admin
        }
      }
      next()
    }
  }
}