import { Button, ChatInputCommand, SelectMenu } from '../../core'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder
} from 'discord.js'
import Wallet from '../../schemata/Wallet'
import Bank from '../../schemata/Bank'
import Xp from '../../schemata/Xp'

export function toOrdnial(n: number) {
  return `${n}${['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th'}`
}

class Leaderboard extends ChatInputCommand {
  name = 'leaderboard'
  description = 'List all members ranked by stats'
  chunk = 10
  emojis = new Collection<string, string>()
    .set('total', '🪙')
    .set('wallet', '👛')
    .set('bank', '🏦')
    .set('activity', '📊')

  constructor() {
    super()
    this.options = [
      {
        name: 'stat',
        description: 'The stat to sort the leaderboard for',
        type: ApplicationCommandOptionType.String,
        choices: this.emojis.map((v, k) => ({
          name: k.replace(/\b\w/g, (c) => c.toUpperCase()).replace('Xp', 'XP'),
          value: k,
          type: ApplicationCommandOptionType
        }))
      }
    ]
  }

  async run(
    inter: ChatInputCommandInteraction | SelectMenuInteraction | ButtonInteraction,
    stat?: 'total' | 'wallet' | 'bank' | 'activity',
    i = 0
  ) {
    stat ??= 'total'

    let stats: Array<{
      userId: string
      value: number
    }>
    let count: number

    if (stat !== 'total') {
      const collection = {
        wallet: Wallet,
        bank: Bank,
        activity: Xp
      }[stat]
      stats = await collection.find(
        { guildId: inter.guildId, value: { $gt: 0 } },
        { userId: 1, value: 1 },
        { limit: this.chunk, skip: i, sort: { value: -1 } }
      )
      count = await collection.count({ guildId: inter.guildId, value: { $gt: 0 } })
    } else {
      const [wallet, bank] = await Promise.all(
        [Wallet, Bank].map(
          async (c) =>
            await c.find({ guildId: inter.guildId, value: { $gt: 0 } }, { userId: 1, value: 1 })
        )
      )
      const keys = [...new Set([...wallet.map((c) => c.userId), ...bank.map((c) => c.userId)])]
      stats = keys
        .map((userId) => ({
          userId,
          value:
            (wallet.find((c) => c.userId === userId)?.value ?? 0) +
            (bank.find((c) => c.userId === userId)?.value ?? 0)
        }))
        .slice(i, i + this.chunk)
        .sort((a, b) => b.value - a.value)
      count = keys.length
    }
    const description =
      stats
        .map(
          (b) =>
            `**${stats.findIndex((v) => v.value === b.value) + i + 1}.** <@${b.userId}> - ${
              stat === 'activity' ? '✨' : '🪙'
            }${b.value}`
        )
        .join('\n') || 'There are currently no users in the leaderboard.'
    const embed = new EmbedBuilder()
      .setTitle(`${stat.replace(/\b\w/g, (c) => c.toUpperCase())} Leaderboard`)
      .setDescription(description)
      .setColor(inter.client.color)
      .setFooter({ text: `Page ${i / this.chunk + 1} / ${Math.ceil(count / this.chunk)}` })

    const select = new SelectMenuBuilder()
      .setCustomId('sortLeaderboard')
      .setPlaceholder('Sort the leaderboard')
      .addOptions(
        this.emojis.map((v, k) =>
          new SelectMenuOptionBuilder()
            .setLabel(k.replace(/\b\w/g, (c) => c.toUpperCase()))
            .setValue(k)
            .setEmoji(v)
            .setDefault(stat === k)
        )
      )
    const sort = new ActionRowBuilder<SelectMenuBuilder>().setComponents(select)

    const first = new ButtonBuilder()
      .setCustomId(`toLeaderboard-${stat}-${0}-f`)
      .setEmoji('⏮️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(i <= 0)
    const prev = new ButtonBuilder()
      .setCustomId(`toLeaderboard-${stat}-${i - this.chunk}-p`)
      .setEmoji('◀️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(i <= 0)
    const next = new ButtonBuilder()
      .setCustomId(`toLeaderboard-${stat}-${i + this.chunk}-n`)
      .setEmoji('▶️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(i >= count - this.chunk)
    const last = new ButtonBuilder()
      .setCustomId(`toLeaderboard-${stat}-${Math.floor(count / this.chunk) * this.chunk}-l`)
      .setEmoji('⏭️')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(i >= count - this.chunk)
    const paginate = new ActionRowBuilder<ButtonBuilder>().setComponents(first, prev, next, last)

    if (inter.isMessageComponent())
      await inter.update({ embeds: [embed], components: [sort, paginate] })
    else await inter.reply({ embeds: [embed], components: [sort, paginate] })
  }
}

export const leaderboard = new Leaderboard()

export class ToLeaderboard extends Button {
  name = 'toLeaderboard'

  override async run(
    inter: ButtonInteraction,
    stat: 'total' | 'wallet' | 'bank' | 'activity',
    i: string
  ) {
    await leaderboard.run(inter, stat, parseInt(i))
  }
}

export class SortLeaderboard extends SelectMenu {
  name = 'sortLeaderboard'

  override async run(inter: SelectMenuInteraction) {
    await leaderboard.run(inter, inter.values[0] as any)
  }
}
