import { Listener } from '../../core'
import { ClientEvents } from 'discord.js'
import mongoose from 'mongoose'
import 'dotenv/config'

export class ConnectMongoose extends Listener {
  event: keyof ClientEvents = 'ready'
  name: string = 'connectMongoose'

  override async run() {
    await mongoose.connect(process.env.MONGO_URI ?? '', { keepAlive: true })
  }
}
