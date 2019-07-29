module.exports = async (chatId, file, telegram, ...args) => {
  switch (file.type) {
    case 'audio':
      return telegram.sendAudio(chatId, file.file_id, ...args)
    case 'video':
      return telegram.sendVideo(chatId, file.file_id, ...args)
    default:
      return telegram.sendDocument(chatId, file.file_id, ...args)
  }
}
