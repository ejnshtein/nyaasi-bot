import collection from './index.js'
const users = collection('users')

export default async (ctx, next) => {
  const { updateType, chat, from } = ctx
  if (
    updateType === 'inline_query' ||
    updateType === 'callback_query' ||
    (updateType === 'message' && chat.type === 'private')
  ) {
    const { id, ...userData } = from
    ctx.state.user = await users.findOneAndUpdate(
      { id },
      { $set: userData },
      { new: true, upsert: true }
    )
  }
  next()
}
