import { Message } from 'grammy/out/platform.node'
import { getUrlInMessage } from './get-url-in-message'

export const loadSearchParams = (
  message: Message,
  page?: string,
  offset?: string
) => {
  const entity = getUrlInMessage(message)
  const location = new URL(entity)
  return {
    params: `p=${page}:o=${offset}`,
    value: location.searchParams.get('q')
  }
}
