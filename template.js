const templates = {
  updated: () => `🗘 Updated ${new Date().getFullYear()}.${(new Date().getMonth() + 1).normalizeZero()}.${new Date().getDate().normalizeZero()} ${new Date().getHours().normalizeZero()}:${new Date().getMinutes().normalizeZero()}:${new Date().getSeconds().normalizeZero()}.${new Date().getMilliseconds()}`,
  searchText: (url, query, page, offset) => `<a href="${url}">${url}</a>\n\n${query ? `Search keyword: ${query}\n` : '' }Page: ${page}\nOffset: ${offset}\n\n<b>${templates.updated()}</b><a href="${url}">&#160;</a>`,
  date: date => `${date.getFullYear()}.${(date.getMonth() + 1).normalizeZero()}.${date.getDate().normalizeZero()} ${date.getHours().normalizeZero()}:${date.getMinutes().normalizeZero()}`
}
module.exports = templates
