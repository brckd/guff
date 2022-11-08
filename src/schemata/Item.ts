import { Document, model, Schema } from 'mongoose'

export interface IItem extends Document {
  guildId: string
  name: string
  price: number
  description: string
  emoji: string
}

export const item = new Schema({
  guildId: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  emoji: {
    type: String,
    default: '📦'
  }
})

export const Item = model<IItem>('Item', item)
