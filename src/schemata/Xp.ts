import mongoose from 'mongoose'

export const xp = new mongoose.Schema({
  guildId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    default: 0
  }
})

export default mongoose.model('Xp', xp)
