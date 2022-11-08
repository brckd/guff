import { Client, Collection } from 'discord.js'
import { ModuleHandler } from './ModuleHandler'
import { Precondition } from './Precondition'
import { join } from 'path'

export class PreconditionHandler extends ModuleHandler {
  override modules!: Collection<string | symbol, Precondition>
  override holds = Precondition

  constructor(client: Client) {
    super(client)
    void this.load(join(__dirname, '../preconditions'))
  }
}
