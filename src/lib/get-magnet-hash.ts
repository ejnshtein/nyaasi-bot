export const getMagnetHash = (magnet: string): string => {
  const urlParams = new URLSearchParams(magnet)
  return urlParams.get('magnet:?xt') || null
}
