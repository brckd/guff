import { Listener, DiscordException, ListenerHandler } from '../../core'
import {
  codeBlock,
  CommandInteraction,
  Colors,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  MessageComponentInteraction,
  ModalSubmitInteraction
} from 'discord.js'

export class CommandError extends Listener<string> {
  event: string = 'commandError'
  name = 'commandError'
  constructor(handler: ListenerHandler) {
    super()
    this.emitter = handler.client.commandHandler
  }

  override async run(inter: CommandInteraction, error: Error) {
    const embed = new EmbedBuilder()
      .setTitle(error.name)
      .setDescription(`${error.message}`)
      .setColor(Colors.Red)

    const components: Array<ActionRowBuilder<ButtonBuilder>> = []
    if (
      !(error instanceof DiscordException) &&
      inter.client.owners.includes(inter.user.id) &&
      error.stack
    ) {
      embed.addFields({
        name: 'Stack',
        value: codeBlock(error.stack.slice(0, 600))
      })
      console.log(error)
    }

    await inter.reply({
      embeds: [embed],
      components,
      ephemeral: true
    })
  }
}
export class ComponentError extends Listener<string> {
  event: string = 'componentError'
  name = 'componentError'
  constructor(handler: ListenerHandler) {
    super()
    this.emitter = handler.client.componentHandler
  }

  override async run(inter: MessageComponentInteraction | ModalSubmitInteraction, error: Error) {
    const embed = new EmbedBuilder()
      .setTitle(error.name)
      .setDescription(`${error.message}`)
      .setColor(Colors.Red)

    const components: Array<ActionRowBuilder<ButtonBuilder>> = []
    if (
      !(error instanceof DiscordException) &&
      inter.client.owners.includes(inter.user.id) &&
      error.stack
    ) {
      embed.setFields({
        name: 'Stack',
        value: codeBlock(error.stack.slice(0, 600))
      })
      console.log(error)
    }

    await inter.reply({
      embeds: [embed],
      components,
      ephemeral: true
    })
  }
}
