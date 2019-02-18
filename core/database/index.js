const mongoose = require('mongoose')
const { Schema } = mongoose

const connection = mongoose.createConnection(process.env.DATABASE_URL, {
  useNewUrlParser: true
})

connection.then(() => {
  console.log('DB connected')
})

connection.catch(err => {
  console.log('mongodb.connectionError', err)
})

connection.on('error', err => {
  console.log('mongodb.connectionError', err)
})
connection.on('disconnected', () => {
  console.log('mongodb.disconnected')
})

const collections = [
  {
    name: 'users',
    schema: new Schema({
      id: {
        type: Number,
        unique: true
      },
      username: {
        type: String,
        required: false
      },
      first_name: {
        type: String,
        required: false
      },
      last_name: {
        type: String,
        required: false
      },
      last_update: {
        type: Date,
        default: () => Date.now()
      },
      saved_torrents: {
        type: [Number],
        required: true,
        default: []
      }
    })
  },
  {
    name: 'torrents',
    schema: new Schema({
      id: {
        type: Number,
        unique: true
      },
      name: String,
      type: String,
      document: {
        type: Object,
        required: false
      },
      video: {
        type: Object,
        required: false
      },
      audio: {
        type: Object,
        required: false
      },
      animation: {
        type: Object,
        required: false
      },
      photo: {
        type: Schema.Types.Mixed,
        required: false
      }
    }, {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    })
  }
]

module.exports = (collectionName) => {
  const collection = collections.find(el => el.name === collectionName)
  if (!collection) {
    throw new Error(`Collection not found: ${collectionName}`)
  }
  return connection.model(collectionName, collection.schema)
}
