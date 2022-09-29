import { Client, ClientOptions } from 'discord.js'
import { ListenerStore } from 'hmues.js'
import { join } from 'path'

export class Guff extends Client {
  constructor(options: Guff.Options) {
    super(options)

    this.listenerStore = new ListenerStore(this)
    this.listenerStore.load(join(__dirname, 'listeners'))
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
    listenerStore: ListenerStore
  }
}
