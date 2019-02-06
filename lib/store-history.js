const getUrlInMessage = require('./get-url-in-message')

module.exports = message => {
  let link = 'https://mangadex.org/search?title='
  try {
    link = getUrlInMessage(message)
  } catch (e) {}
  return `<a href="${link}">&#8203;</a>`
}
