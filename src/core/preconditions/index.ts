import { BitFieldResolvable, PermissionsString } from 'discord.js'
import { BucketScope } from '../types/enums'

export interface Preconditions {
  GuildOnly: {}
  NsfwOnly: {}
  ClientPermissions: {
    clientPermissions: BitFieldResolvable<PermissionsString, bigint>
  }
  Cooldown: {
    cooldown: {
      /** Timeout in ms */
      delay: number
      /** Amount of uses until being timeouted */
      limit?: number
      /** The scope the cooldown applies to */
      scope?: BucketScope
    }
  }
}

export * from './GuildOnly'
export * from './NsfwOnly'
export * from './ClientPermissions'
export * from './Cooldown'
