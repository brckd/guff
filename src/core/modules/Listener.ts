import { Module } from './Module'
import { EventEmitter } from 'events'
import { Awaitable, ClientEvents } from 'discord.js'
import { ListenerHandler } from './ListenerHandler'

/** Represents a listener */
export abstract class Listener<Event extends string = keyof ClientEvents> extends Module {
  emitter!: EventEmitter
  abstract event: Event
  once?: boolean

  constructor(handler?: ListenerHandler) {
    super()
    if (handler) this.emitter = handler.client
  }

  /**
   * Listener callback
   * @param args Arguments from the event
   */
  abstract run(...args: unknown[]): Awaitable<void>
}
