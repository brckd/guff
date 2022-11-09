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
    'https://discord.com/api/oauth2/authorize?client_id=1012759255641751613&permissions=8192&scope=bot%20applications.commands'
})

void client.login(process.env.TOKEN)
