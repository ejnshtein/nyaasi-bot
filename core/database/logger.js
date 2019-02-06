module.exports = () => async ({ updateType, chat, from, db }, next) => {
  if (
    (
      updateType === 'callback_query' || updateType === 'message'
    )
    && chat.type === 'private') {
    const user = await db('users').findOne({ id: from.id }).exec()
    if (user) {
      await db('users').updateOne({ id: from.id }, { $set: { last_update: Date.now() } }).exec()
    } else {
      await db('users').create({ id: from.id })
    }
  }
  next()
}
