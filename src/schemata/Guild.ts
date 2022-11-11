import mongoose from 'mongoose'

export const guild = new mongoose.Schema({
  id: {
    type: String,
    required: true
  },
  levelupChannel: {
    type: String
  },
  welcomeChannel: {
    type: String
  }
})

export default mongoose.model('Guild', guild)
