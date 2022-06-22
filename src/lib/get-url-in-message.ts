import { Message } from 'grammy/out/platform.node'

export const getUrlInMessage = (message: Message) => {
  const entities = message.entities!.filter((el) => el.type === 'text_link')
  return entities[entities.length - 1]
    ? entities[entities.length - 1].url
    : `https://${process.env.HOST}/?q=`
}
