import { Context } from 'grammy'

export const onlyGroup = (ctx: Context): boolean =>
  Boolean(
    ctx.chat && (ctx.chat.type === 'group' || ctx.chat.type === 'supergroup')
  )
