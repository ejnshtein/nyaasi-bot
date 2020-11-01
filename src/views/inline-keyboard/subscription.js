import collection from '../../core/database/index.js'
import { buttons } from '../../lib/index.js'

export default async function SubscriptionKeyboard (chatId, text = '', offset = 0, publicGroup = false) {
  const query = {}
  if (text) {
    query.name = {
      $regex: text,
      $options: 'i'
    }
  }
  const subscriptions = await collection('subscriptions')
    .aggregate(
      [
        {
          $match: {
            $expr: query
          }
        },
        {
          $addFields: {
            subscribed: {
              $in: [chatId, '$chats']
            }
          }
        },
        {
          $project: {
            users: 0
          }
        },
        {
          $skip: offset
        },
        {
          $limit: 10
        }
      ]
    )

  // console.log(subscriptions)

  const keyboard = subscriptions.map(
    el => {
      const { _id, name, subscribed } = el

      return [
        {
          text: `${subscribed ? '-' : '+'} ${name}`,
          callback_data: `subscribe:id=${_id}&offset=${offset}`
        }
      ]
    }
  )

  const navigation = [
    // {
    //   text: 'refresh',
    //   callback_data: `subscription:offset=${offset}&refresh=1`
    // }
  ]

  // if (publicGroup) {
  navigation.push(
    {
      text: 'Done',
      callback_data: 'delete'
    }
  )
  // }

  if (offset >= 10) {
    navigation.unshift(
      {
        text: buttons.page.prev(10),
        callback_data: `subscription:offset=${offset - 10}&refresh=0`
      }
    )
  }

  if (subscriptions.length === 10) {
    navigation.push(
      {
        text: buttons.page.next(10),
        callback_data: `subscription:offset=${offset + 10}&refresh=0`
      }
    )
  }

  if (navigation.length > 0) {
    keyboard.unshift(navigation)
  }

  return {
    count: subscriptions.length,
    keyboard
  }
}
