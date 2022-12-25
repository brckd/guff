import mongoose from 'mongoose'

export const filter = new mongoose.Schema({
  channelId: {
    type: String,
    required: true
  },
  images: Boolean,
  videos: Boolean,
  audio: Boolean,
  match: String,
  levelUps: {
    type: Boolean,
    default: true
  }
})

export default mongoose.model('Filter', filter)
