/* eslint-disable @typescript-eslint/no-misused-promises */
import { Collection } from 'discord.js'
import { ModuleHandler } from './ModuleHandler'
import { Listener } from './Listener'

/** Loads and handles events */
export class ListenerHandler extends ModuleHandler {
  override modules!: Collection<string, Listener>
  override holds = Listener

  override async register(module: Listener, filepath?: string): Promise<void> {
    if (this.modules.has(module.name)) await this.remove(module.name)

    await super.register(module, filepath)

    module.run = module.run.bind(module)
    if (module.once) module.emitter.once(module.event, module.run)
    else module.emitter.on(module.event, module.run)
  }

  override deregister(module: Listener): void {
    module.emitter.removeListener(module.event, module.run)
    void super.deregister(module)
  }
}
