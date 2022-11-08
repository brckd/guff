import { BitFieldResolvable, normalizeArray, PermissionsString, RestOrArray } from 'discord.js'
import { DiscordException } from './DiscordException'

export class MissingPermissions extends DiscordException {
  override name = 'Missing Permissions'

  constructor(...permissions: RestOrArray<BitFieldResolvable<PermissionsString, bigint>>) {
    super(
      `You don't have the required permissions to do that${
        normalizeArray(permissions).length > 0
          ? `: ${normalizeArray(permissions).map((p) => p ?? 'undefined')}`
          : ''
      }`
    )
  }
}
