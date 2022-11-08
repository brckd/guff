import { Client, Collection, Interaction } from 'discord.js'
import { BaseComponent } from './Component'
import { ModuleHandler, ModuleHandlerEvents } from './ModuleHandler'
import { PreconditionHandler } from './PreconditionHandler'

export interface ComponentHandlerEvents extends ModuleHandlerEvents {
  commandError: [Interaction, Error]
}

export class ComponentHandler extends ModuleHandler<ComponentHandlerEvents> {
  override modules!: Collection<string | symbol, BaseComponent>
  override holds = BaseComponent
  preconditionHandler: PreconditionHandler

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
        if (error instanceof Error) this.emit('componentError', interaction, error)
        else console.error(error)
      }
    })
  }

  async handle(interaction: Interaction): Promise<void> {
    if (!interaction.isMessageComponent() && !interaction.isModalSubmit()) return

    const [customId, ...options] = interaction.customId.split('-')
    const module = this.modules.get(customId)
    if (!module) return

    for (const precondition of module.preconditions)
      await this.preconditionHandler.modules.get(precondition)?.run(interaction, module)

    await this.modules.get(customId)?.run(interaction, ...options)
  }
}
