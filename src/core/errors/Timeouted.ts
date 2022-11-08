import { DiscordException } from './DiscordException'

export class Timeouted extends DiscordException {
  override name = 'Timeouted'

  constructor(until?: number) {
    super('You have been timeouted' + (until ? `. Try again <t:${Math.floor(until)}:R>` : ''))
  }
}
