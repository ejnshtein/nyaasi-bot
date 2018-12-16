module.exports = async ({ chat, reply }, next) => {
  if (chat.type === 'private') {
    next()
  } else if (chat.type === 'group' || chat.type === 'supergroup') {
    reply('This bot works only in private chat.')
  }
}
