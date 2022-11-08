export class DiscordException extends Error {
  override name = 'Discord Exception'

  constructor(message: string)
  constructor(name: string, message: string)
  constructor(arg1: string, arg2?: string) {
    super(arg2 ?? arg1)
    if (arg2) this.name = arg1
  }
}
