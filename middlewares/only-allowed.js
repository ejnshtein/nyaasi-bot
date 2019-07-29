module.exports = async ({ db, from }, next) => {
  const user = await db('users').findOne({ id: from.id }).exec()
  if (user.allow_torrent_download) {
    return next()
  }
}
