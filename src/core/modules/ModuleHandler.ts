import { Client, Collection, Awaitable } from 'discord.js'
import { EventEmitter } from 'events'
import { Module } from './Module'
import { join, resolve } from 'path'
import { readdir, stat } from 'fs/promises'

export interface ModuleHandlerEvents extends Record<string, any[]> {
  register: [Module]
  deregister: [Module]
}

export interface ModuleHandler<Events extends ModuleHandlerEvents = ModuleHandlerEvents>
  extends EventEmitter {
  on<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this
  on<S extends string | symbol>(
    event: Exclude<S, keyof Events>,
    listener: (...args: any[]) => Awaitable<void>
  ): this

  once<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this
  once<S extends string | symbol>(
    event: Exclude<S, keyof Events>,
    listener: (...args: any[]) => Awaitable<void>
  ): this

  emit<K extends keyof Events>(event: K, ...args: Events[K]): boolean
  emit<S extends string | symbol>(event: Exclude<S, keyof Events>, ...args: unknown[]): boolean

  off<K extends keyof Events>(event: K, listener: (...args: Events[K]) => Awaitable<void>): this
  off<S extends string | symbol>(
    event: Exclude<S, keyof Events>,
    listener: (...args: any[]) => Awaitable<void>
  ): this

  removeAllListeners<K extends keyof Events>(event?: K): this
  removeAllListeners<S extends string | symbol>(event?: Exclude<S, keyof Events>): this
}

/** Base class for a module handler */
export class ModuleHandler extends EventEmitter {
  /** The client */
  client: Client
  /** Collection of modules */
  modules: Collection<string | symbol, Module>
  /** Module constructor */
  holds: abstract new (...args: any[]) => Module = Module

  /**
   * @param client The client
   */
  constructor(client: Client) {
    super()
    this.client = client
    this.modules = new Collection()
  }

  /**
   * Default filter to load files
   * @param filepath
   * @returns Whether the file should be loaded
   */
  filter(filepath: string): boolean {
    return /.+(\.js|\.json|(?<!\.d)\.ts)/.test(filepath)
  }

  /**
   * Register a module
   * @param module The module
   * @param filepath The module's filepath
   */
  register(module: Module, filepath?: string): Awaitable<void> {
    module.filepath = module.filepath ?? filepath
    this.modules.set(module.name, module)

    this.emit('register', module)
  }

  /**
   * Load all modules
   * @param directory Module directory
   * @param filter Filter to load files
   */
  async load(
    directory: string,
    filter: (filepath: string) => boolean = this.filter
  ): Promise<void> {
    directory = resolve(directory)

    for (const filepath of await (this.constructor as typeof ModuleHandler).readdirRecursive(
      directory
    )) {
      if (!filter.call(this, filepath)) continue
      const modules = await import(filepath)

      for (const module in modules) {
        if (modules[module] instanceof this.holds) await this.register(modules[module], directory)
        else if (modules[module].prototype instanceof this.holds)
          await this.register(new modules[module](this), directory)
      }
    }
  }

  /**
   * Deregister a module
   * @param module The module
   */
  deregister(module: Module): Awaitable<void> {
    this.modules.delete(module.name)

    this.emit('deregister', module)
  }

  /**
   * Deregister a module
   * @param name Unique name of the module
   */
  remove(name: string | symbol): Awaitable<void> {
    const module = this.modules.get(name)
    if (module) void this.deregister(module)
  }

  /**
   * Reads files recursively from a directory
   * @param directory Path of the file or directory
   */
  static async readdirRecursive(directory: string): Promise<string[]> {
    const result: string[] = []

    await (async function read(directory) {
      if ((await stat(directory)).isDirectory()) {
        for (const dir of await readdir(directory)) await read(join(directory, dir))
      } else {
        result.push(directory)
      }
    })(directory)

    return result
  }
}
