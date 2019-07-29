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
      },
      allow_torrent_download: {
        type: Boolean,
        default: false,
        required: true
      },
      allow_get_torrent_files: {
        type: Boolean,
        default: false,
        required: true
      },
      is_admin: {
        type: Boolean,
        default: false,
        required: true
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
      title: String,
      category: [
        new Schema({
          title: String,
          code: String
        }, {
          _id: false,
          versionKey: false
        })
      ],
      entry: {
        type: String,
        required: false,
        default: 'default' // 'success', 'danger'
      },
      links: {
        torrent: String,
        magnet: String
      },
      files: {
        type: [
          new Schema({
            id: { // local file id for this torrent
              type: Number,
              required: true
            },
            type: { // 'document', 'video', 'photo', 'audio'
              type: String,
              required: true
            },
            file_id: {
              type: String,
              required: true
            },
            caption: {
              type: String,
              required: true
            }
          }, {
            _id: false,
            versionKey: false
          })
        ],
        required: false,
        default: []
      },
      status: { // 'pending', 'empty', 'uploaded', 'fileserror', 'error'
        type: String,
        required: true,
        default: 'empty'
      },
      status_text: { // short description of *status* field, used for errors
        type: String,
        required: true,
        default: 'all fine' // if 'fileserror': 'Size of some of files is bigger than 1.5gb.',
        // 'Too many files. Max 14', 'Upload error', 'Download error', 'We dont know what happend ¯\_(ツ)_/¯'
      },
      is_finished: {
        type: Boolean,
        default: false
      },
      submitter: {
        name: {
          type: String,
          default: 'Anonymous'
        },
        link: {
          type: String,
          require: false
        }
      },
      timestamp: String,
      info: String,
      info_hash: String
    }, {
      timestamps: {
        createdAt: 'created_at',
        updatedAt: 'updated_at'
      }
    })
  },
  {
    name: 'servers',
    schema: new Schema({
      id: {
        type: Number,
        unique: true,
        default: 1
      },
      torrents: [
        new Schema({
          id: Number,
          files: [
            new Schema({
              id: {
                type: String,
                default: '',
                required: true
              },
              done: {
                type: Boolean,
                default: false
              },
              path: String,
              name: String,
              total_bytes: {
                type: Number,
                default: 0
              },
              uploaded_bytes: {
                type: Number,
                default: 0
              },
              downloaded_bytes: {
                type: Number,
                default: 0
              },
              is_downloading_active: {
                type: Boolean,
                default: false
              },
              is_downloading_completed: {
                type: Boolean,
                default: false
              },
              is_uploading_active: {
                type: Boolean,
                default: false
              },
              is_uploading_completed: {
                type: Boolean,
                default: false
              }
            })
          ]
        })
      ]
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
