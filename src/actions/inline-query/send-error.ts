import { InlineQueryResultArticle } from 'grammy/out/platform.node'

export const sendError = (error: Error): InlineQueryResultArticle => ({
  type: 'article',
  id: '1',
  title: 'Error!',
  description: `Something went wrong... ${error.message}`,
  input_message_content: {
    message_text: `Something went wrong... ${error.message}`
  }
})
