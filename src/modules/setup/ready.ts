import { Listener } from '../../core'
import chalk from 'chalk'
import { Client, ClientEvents } from 'discord.js'

export class Ready extends Listener {
  event: keyof ClientEvents = 'ready'
  name: string = 'ready'

  override run(client: Client) {
    console.log(
      `Logged in as ${chalk.hex(`#${client.color?.toString(16).padStart(6, '#')}`)(
        client.user?.username
      )}!`
    )
  }
}
