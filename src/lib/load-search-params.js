import getUrlInMessage from './get-url-in-message.js'

export default (message, page, offset) => {
  const entity = getUrlInMessage(message)
  page = Number.parseInt(page)
  offset = Number.parseInt(offset)
  const location = new URL(entity)
  return {
    params: `p=${page}:o=${offset}`,
    value: location.searchParams.get('q')
  }
}
