import { TelegrafContext } from 'telegraf'
import { UserModel } from '@models/User'

export default async function (
  ctx: TelegrafContext,
  next: () => Promise<void>
): Promise<void> {
  const { updateType, chat, from } = ctx
  if (
    updateType === 'inline_query' ||
    updateType === 'callback_query' ||
    (updateType === 'message' && chat.type === 'private')
  ) {
    const { id, ...userData } = from
    ctx.state.user = await UserModel.findOneAndUpdate(
      {
        id
      },
      {
        $set: userData
      },
      {
        new: true,
        upsert: true
      }
    )
  }
  next()
}
