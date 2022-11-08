import { BaseInteraction, CacheType } from 'discord.js'
import { BucketScope } from '../types/enums'
import { Timeouted } from '../errors'
import { Precondition } from '../modules'
import { Preconditions } from '.'

export class Cooldown extends Precondition {
  name = 'Cooldown'
  buckets: WeakMap<Preconditions['Cooldown'], Map<string, number>> = new WeakMap()

  override run(interaction: BaseInteraction<CacheType>, context: Preconditions['Cooldown']): void {
    if (!this.buckets.has(context)) this.buckets.set(context, new Map())
    const bucketId = this.getBucketId(interaction, context.cooldown.scope)

    const now = Date.now()
    const start = this.buckets.get(context)?.get(bucketId)

    if (start && now - start < context.cooldown.delay)
      throw new Timeouted((start + context.cooldown.delay) / 1000)
    else this.buckets.get(context)?.set(bucketId, now)
  }

  getBucketId(interaction: BaseInteraction, scope?: BucketScope): string {
    switch (scope) {
      case BucketScope.Global:
        return 'global'
      case BucketScope.Channel:
        return interaction.channelId ?? interaction.user.id
      case BucketScope.Guild:
        return interaction.guildId ?? interaction.channelId ?? interaction.user.id
      default:
        return interaction.user.id
    }
  }
}
