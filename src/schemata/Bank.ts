import mongoose from 'mongoose'

export const bank = new mongoose.Schema({
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

export default mongoose.model('Bank', bank)
