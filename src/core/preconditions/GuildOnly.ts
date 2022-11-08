import { Interaction } from 'discord.js'
import { GuildOnly } from '../errors'
import { Precondition } from '../modules'

export class GuildOnlyPrecondition extends Precondition {
  name = 'GuildOnly'
  override run(interaction: Interaction): void {
    if (!interaction.inGuild()) throw new GuildOnly()
  }
}
