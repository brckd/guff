import mongoose from 'mongoose'

export const lottery = new mongoose.Schema({
  lotteryId: {
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

export default mongoose.model('Lottery', lottery)
