module.exports = () => async (ctx, next) => {
  if (
    (
      ctx.updateType === 'callback_query' || ctx.updateType === 'message'
    ) &&
    ctx.chat.type === 'private'
  ) {
    let user = await ctx.db('users').findOne({ id: ctx.from.id }).exec()
    if (user) {
      await ctx.db('users').updateOne({ id: ctx.from.id }, { $set: { last_update: Date.now() } }).exec()
    } else {
      user = await ctx.db('users').create(ctx.from)
    }
    ctx.state.user = user
  }
  next()
}
