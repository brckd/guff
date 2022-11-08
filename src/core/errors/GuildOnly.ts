import { DiscordException } from './DiscordException'

export class GuildOnly extends DiscordException {
  override name = 'Guild Only'

  constructor() {
    super('This command can only be run in a guild')
  }
}
