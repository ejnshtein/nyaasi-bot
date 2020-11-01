export default async ({ state }, next) => {
  if (state.user.allow_torrent_download) {
    return next()
  }
}
