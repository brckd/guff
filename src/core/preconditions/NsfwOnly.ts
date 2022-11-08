import { BaseGuildTextChannel, Interaction } from 'discord.js'
import { NsfwOnly } from '../errors'
import { Precondition } from '../modules'

export class NsfwOnlyPrecondition extends Precondition {
  name = 'NsfwOnly'
  override run(interaction: Interaction): void {
    if (interaction.channel instanceof BaseGuildTextChannel && interaction.channel.nsfw)
      throw new NsfwOnly()
  }
}
