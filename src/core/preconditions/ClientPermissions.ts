import { BaseInteraction, CacheType } from 'discord.js'
import { Preconditions } from '.'
import { ClientMissingPermissions } from '../errors'
import { Precondition } from '../modules'

export class ClientPermissions extends Precondition {
  name = 'ClientPermissions'
  override run(
    interaction: BaseInteraction<CacheType>,
    context: Preconditions['ClientPermissions']
  ): void {
    const missing = interaction.appPermissions?.missing(context.clientPermissions)
    if (missing && missing.length > 0) throw new ClientMissingPermissions(missing)
  }
}
