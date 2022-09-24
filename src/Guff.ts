import { Client, ClientOptions } from 'discord.js'

export class Guff extends Client {
  constructor(options: Guff.Options) {
    super(options)

    this.color = options.color ?? null
  }
}

export namespace Guff {
  export interface Options extends ClientOptions {
    color?: number
  }
}

declare module 'discord.js' {
  interface Client {
    color: number | null
  }
}
