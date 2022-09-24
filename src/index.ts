import { Guff } from './Guff'
import 'dotenv/config'
import chalk from 'chalk'
import { Colors } from 'discord.js'

const client = new Guff({
  intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
  color: Colors.Green
})

client.login(process.env.TOKEN)

client.on('ready', (c) =>
  console.log(`Logged in as ${chalk.hex(`#${client.color?.toString(16)}`)(c.user.tag)}`)
)
