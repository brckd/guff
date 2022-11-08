import {
  Awaitable,
  ButtonInteraction,
  ComponentType,
  Interaction,
  ModalSubmitInteraction,
  SelectMenuInteraction
} from 'discord.js'
import { Preconditions } from '../preconditions'
import { Module } from './Module'

export abstract class BaseComponent extends Module {
  abstract type: ComponentType
  preconditions: Array<keyof Preconditions> = []
  abstract run(interaction: Interaction, ...options: string[]): Awaitable<void>
}

export abstract class Button extends BaseComponent {
  type = ComponentType.Button as const
  abstract override run(interaction: ButtonInteraction, ...options: string[]): Awaitable<void>
}

export abstract class SelectMenu extends BaseComponent {
  type = ComponentType.SelectMenu as const
  abstract override run(interaction: SelectMenuInteraction, ...options: string[]): Awaitable<void>
}

export abstract class Modal extends BaseComponent {
  type = ComponentType.TextInput as const
  abstract override run(interaction: ModalSubmitInteraction, ...options: string[]): Awaitable<void>
}
