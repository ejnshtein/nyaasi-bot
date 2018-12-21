const getMessageEntity = require('./get-message-entity')

module.exports = (param, message) => {
  const entity = getMessageEntity(message)
  const url = new URL(entity.url)
  if (url.searchParams.has(param)) {
    return url.searchParams.get(param)
  } else {
    return undefined
  }
}
