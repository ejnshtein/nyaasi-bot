import mongoose from 'mongoose'

const { Schema } = mongoose

export const Subscription = new Schema(
  {
    name: {
      type: String,
      required: true
    },
    test: {
      type: {
        regex: {
          type: String,
          required: true
        },
        options: {
          type: String,
          required: true,
          default: 'i'
        }
      },
      required: true
    },
    options: {
      type: {
        submitter: {
          type: String,
          required: true,
          default: 'any'
        },
        trusted: {
          type: Boolean
        },
        remake: {
          type: Boolean
        }
      },
      required: true,
      default: {
        submitter: 'any'
      }
    },
    users: {
      type: [Number],
      required: true,
      default: []
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
)
