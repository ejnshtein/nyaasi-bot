import mongoose from 'mongoose'

const { Schema } = mongoose

export const User = new Schema({
  id: {
    type: Number,
    required: true
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
