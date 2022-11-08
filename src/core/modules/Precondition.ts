import { Awaitable, BaseInteraction } from 'discord.js'
import { Module } from './Module'

export abstract class Precondition extends Module {
  /**
   * Precondition callback
   * @param interaction Interaction that triggered the command
   */
  abstract run(interaction: BaseInteraction, context: unknown): Awaitable<void>

  /**
   * Precondition callback
   * @param interaction Interaction that triggered the command
   */
  abstract run(interaction: BaseInteraction, context: unknown): Awaitable<void>
}
