import { Client, ClientOptions, TextChannel, Webhook } from 'discord.js'
import { CommandHandler, ComponentHandler, ListenerHandler, PreconditionHandler } from './core'
import { join } from 'path'

declare module 'discord.js' {
  interface Client {
    listenerHandler: ListenerHandler
    preconditionHandler: PreconditionHandler
    commandHandler: CommandHandler
    componentHandler: ComponentHandler

    owners: string[]
    color: number | null
    inviteURL: string

    provideWebhook(channel: TextChannel): Promise<Webhook>
  }
}

export interface HydroClientOptions extends ClientOptions {
  owners?: string[]
  color?: number
  inviteURL?: string
}

export class HydroClient extends Client {
  constructor(options: HydroClientOptions) {
    super(options)

    this.owners = options.owners ?? []
    this.color = options.color ?? null
    this.inviteURL = options.inviteURL ?? ''

    this.preconditionHandler = new PreconditionHandler(this)

    this.commandHandler = new CommandHandler(this, {
      preconditionHandler: this.preconditionHandler
    })
    void this.commandHandler.load(join(__dirname, 'modules'))

    this.componentHandler = new ComponentHandler(this, {
      preconditionHandler: this.preconditionHandler
    })
    void this.componentHandler.load(join(__dirname, 'modules'))

    this.listenerHandler = new ListenerHandler(this)
    void this.listenerHandler.load(join(__dirname, 'modules'))
  }

  override async provideWebhook(channel: TextChannel): Promise<Webhook> {
    return (
      (await channel.fetchWebhooks())?.find((w) => w.applicationId === this.application?.id) ??
      (await channel.createWebhook({
        name: `${this.user?.username} Hook`,
        avatar: this.user?.avatarURL()
      }))
    )
  }
}
