export default magnet => {
  const urlParams = new URLSearchParams(magnet)
  return urlParams.get('magnet:?xt') || undefined
}
