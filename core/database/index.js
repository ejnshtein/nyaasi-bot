import mongoose from 'mongoose'
import env from '../../env.js'
import { User } from './schemas/User.js'
import { Chat } from './schemas/Chat.js'
import { Torrent } from './schemas/Torrent.js'
import { Subscription } from './schemas/Subscription.js'

const { createConnection } = mongoose

const connection = createConnection(env.DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: true
})

connection.then(() => {
  console.log('DB connected')
})

connection.catch(err => {
  console.log('mongodb.connectionError', err)
})

const collections = [
  {
    name: 'users',
    schema: User
  },
  {
    name: 'chats',
    schema: Chat
  },
  {
    name: 'torrents',
    schema: Torrent
  },
  {
    name: 'subscriptions',
    schema: Subscription
  }
]

collections.forEach(collection => {
  if (collection.pre) {
    Object.keys(collection.pre).forEach(preKey => {
      collection.schema.pre(preKey, collection.pre[preKey])
    })
  }
  if (collection.method) {
    collection.schema.method(collection.method)
  }
  if (collection.virtual) {
    Object.keys(collection.virtual).forEach(virtual => {
      collection.schema.virtual(virtual, collection.virtual[virtual])
    })
  }
  connection.model(collection.name, collection.schema)
})

export default collectionName => {
  const collection = collections.find(el => el.name === collectionName)
  if (collection) {
    return connection.model(collection.name, collection.schema)
  } else {
    throw new Error('Collection not found')
  }
}