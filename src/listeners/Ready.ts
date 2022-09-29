import chalk from 'chalk'
import { Client } from 'discord.js'
import { Listener } from 'hmues.js'

export class Ready extends Listener<'ready'> {
  constructor(options: Listener.Options) {
    super({
      ...options,
      event: 'ready'
    })
  }

  run(client: Client<true>) {
    console.log(`Logged in as ${chalk.hex(`#${client.color?.toString(16)}`)(client.user.tag)}!`)
  }
}
