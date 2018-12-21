/* eslint operator-linebreak:0, no-mixed-operators:0 */
const collection = require('./mongodb')
const users = collection('users')
module.exports = {
  collection,
  logger () {
    return async ({ updateType, chat, from }, next) => {
      if (updateType === 'callback_query'
        || updateType === 'message' && chat.type === 'private') {
        const user = await users.findOne({ id: from.id }).exec()
        if (user) {
          await users.updateOne({ id: from.id }, { $set: { last_update: Date.now() } }).exec()
        } else {
          await users.create({ id: from.id })
        }
      }
      next()
    }
  }
}
