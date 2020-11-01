import mongoose from 'mongoose'

const { Schema } = mongoose

export const Chat = new Schema(
  {
    id: {
      type: Number,
      unique: true
    },
    username: {
      type: String,
      required: false
    },
    title: {
      type: String,
      required: true
    },
    silent_mode: {
      type: Boolean,
      required: true,
      default: true
    }
  },
  {
    timestamps: {
      updatedAt: 'updated_at',
      createdAt: 'created_at'
    }
  }
)
