module.exports = async ({ chat }, next) => {
  if (chat.type === 'private') {
    if (typeof next === 'function') {
      next()
    } else {
      return true
    }
  }
  // else if (chat.type === 'group' || chat.type === 'supergroup') {
  //   reply('This bot works only in private chat.')
  // }
}
