import mongoose from 'mongoose'

export const wallet = new mongoose.Schema({
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

export default mongoose.model('Wallet', wallet)
