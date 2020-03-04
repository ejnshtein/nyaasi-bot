import mongoose from 'mongoose'

const { Schema } = mongoose

export const Torrent = new Schema({
  // id: {
  //   type: Number,
  //   unique: true
  // },
  // title: String,
  // category: [
  //   new Schema({
  //     title: String,
  //     code: String
  //   })
  // ],
  // entry: {
  //   type: String,
  //   required: false,
  //   default: 'default'
  // },
  // links: {
  //   torrent: String,
  //   magnet: String
  // },
  // files: {
  //   type: [
  //     new Schema({
  //       id: { // local file id for this torrent
  //         type: Number,
  //         required: true
  //       },
  //       type: { // 'document', 'video', 'photo', 'audio'
  //         type: String,
  //         required: true
  //       },
  //       file_id: {
  //         type: String,
  //         required: true
  //       },
  //       caption: {
  //         type: String,
  //         required: true
  //       }
  //     }, {
  //       _id: false,
  //       versionKey: false
  //     })
  //   ],
  //   required: false,
  //   default: []
  // },
  // status: { // 'pending', 'empty', 'uploaded', 'fileserror', 'error'
  //   type: String,
  //   required: true,
  //   default: 'empty'
  // },
  // status_text: { // short description of *status* field, used for errors
  //   type: String,
  //   required: true,
  //   default: 'all fine' // if 'fileserror': 'Size of some of files is bigger than 1.5gb.',
  //   // 'Too many files. Max 14', 'Upload error', 'Download error', 'We dont know what happend ¯\_(ツ)_/¯'
  // },
  // is_finished: {
  //   type: Boolean,
  //   default: false
  // },
  // submitter: {
  //   name: {
  //     type: String,
  //     default: 'Anonymous'
  //   },
  //   link: {
  //     type: String,
  //     require: false
  //   }
  // },
  // timestamp: String,
  // info: String,
  // info_hash: String
}, {
  strict: false,
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
})
