import { Guff } from './Guff'
import 'dotenv/config'
import { Colors } from 'discord.js'

const client = new Guff({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
  color: Colors.Green
})

client.login(process.env.TOKEN)
