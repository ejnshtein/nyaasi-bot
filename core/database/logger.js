import collection from './index.js'
const users = collection('users')
const chats = collection('chats')

export default async function logger ({ updateType, chat, from, state }, next) {
  if (
    updateType === 'callback_query' ||
    (updateType === 'message' && chat.type === 'private')
  ) {
    const { id, ...userData } = from
    state.user = await users.findOneAndUpdate(
      { id },
      { $set: userData },
      { new: true }
    )
    if (!state.user) {
      state.user = await users.create(from)
    }
  }
  if (chat.type && ['supergroup', 'group'].includes(chat.type)) {
    const { id, ...chatData } = chat
    state.chat = await chats.findOneAndUpdate(
      { id },
      { $set: chatData },
      { new: true }
    )
    if (!state.chat) {
      state.chat = await chats.create(chat)
    }
  }
  next()
}
