import { ApplicationCommandOptionType, Client, Collection, Interaction } from 'discord.js'
import { ModuleHandler, ModuleHandlerEvents } from './ModuleHandler'
import {
  Command,
  BaseCommand,
  ChatInputCommand,
  UserContextMenuCommand,
  MessageContextMenuCommand
} from './Command'
import { PreconditionHandler } from './PreconditionHandler'

export interface CommandHandlerEvents extends ModuleHandlerEvents {
  commandError: [Interaction, Error]
}

export class CommandHandler extends ModuleHandler<CommandHandlerEvents> {
  override modules!: Collection<string | symbol, Command>
  preconditionHandler: PreconditionHandler
  override holds = BaseCommand

  constructor(
    client: Client,
    options?: {
      preconditionHandler?: PreconditionHandler
    }
  ) {
    super(client)
    this.preconditionHandler = options?.preconditionHandler ?? new PreconditionHandler(client)
    this.setup()
  }

  setup(): void {
    this.client.on('interactionCreate', async (interaction) => {
      try {
        await this.handle(interaction)
      } catch (error) {
        if (error instanceof Error) this.emit('commandError', interaction, error)
        else console.error(error)
      }
    })

    this.client.once('ready', async (client) => {
      await client.application.commands.set(this.modules.map((m) => m))
    })
  }

  async handle(interaction: Interaction): Promise<void> {
    if (!interaction.isCommand()) return

    const module = this.modules.get(interaction.commandName)
    if (!module) return

    for (const precondition of module.preconditions)
      await this.preconditionHandler.modules.get(precondition)?.run(interaction, module)

    if (interaction.isChatInputCommand())
      await (module as ChatInputCommand).run(
        interaction,
        ...(module as ChatInputCommand).options.map((o) => {
          const option = interaction.options.get(o.name)
          switch (option?.type) {
            case ApplicationCommandOptionType.Attachment:
              return option.attachment ?? null
            case ApplicationCommandOptionType.Channel:
              return option.channel ?? null
            case ApplicationCommandOptionType.Mentionable:
              return option?.member ?? option?.user ?? option?.role ?? null
            case ApplicationCommandOptionType.Role:
              return option.role ?? null
            case ApplicationCommandOptionType.User:
              return option.user ?? null
            default:
              return option?.value ?? null
          }
        })
      )
    else if (interaction.isUserContextMenuCommand())
      await (module as UserContextMenuCommand).run(interaction, interaction.targetUser)
    else if (interaction.isMessageContextMenuCommand())
      await (module as MessageContextMenuCommand).run(interaction, interaction.targetMessage)
  }

  override async register(module: Command, filepath?: string): Promise<void> {
    if (this.client.isReady()) await this.client.application?.commands.create(module)
    await super.register(module, filepath)
  }

  override async deregister(module: Command): Promise<void> {
    const id = this.client.application?.commands.cache.find((c) => c.name === module.name)?.id
    if (id) await this.client.application?.commands.delete(id)
    await super.deregister(module)
  }
}
