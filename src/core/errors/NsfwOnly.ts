import { DiscordException } from './DiscordException'

export class NsfwOnly extends DiscordException {
  override name = 'NSFW Only'

  constructor() {
    super('This command can only be run in a NSFW channel')
  }
}
