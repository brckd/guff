import { HydroClient } from '.'
import { Colors, Partials } from 'discord.js'
import 'dotenv/config'

const client = new HydroClient({
  intents: [
    'Guilds',
    'DirectMessages',
    'GuildMembers',
    'GuildMessages',
    'DirectMessages',
    'MessageContent'
  ],
  partials: [Partials.Channel, Partials.Message],
  allowedMentions: { parse: ['roles', 'users'] },

  owners: ['691572882148425809'],
  color: Colors.Purple,
  inviteURL:
    'https://discord.com/api/oauth2/authorize?client_id=986707906999251014&permissions=76800&scope=bot%20applications.commands'
})

void client.login(process.env.TOKEN)
