import { ChatInputCommand, SelectMenu } from '../../core'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder
} from 'discord.js'
import Cash from '../../schemata/Wallet'
import Bank from '../../schemata/Bank'
import Xp from '../../schemata/Xp'

export function toOrdnial(n: number) {
  return `${n}${['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th'}`
}

class Leaderboard extends ChatInputCommand {
  name = 'leaderboard'
  description = 'List all members ranked by stats'
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

  async run(inter: ChatInputCommandInteraction | SelectMenuInteraction, stat?: string) {
    stat ??= 'total'
    const wallet = await Cash.find({ guildId: inter.guildId })
    const bank = await Bank.find({ guildId: inter.guildId })
    const xp = await Xp.find({ guildId: inter.guildId })
    const balances = (
      stat === 'wallet'
        ? wallet
        : stat === 'bank'
        ? bank
        : stat === 'activity'
        ? xp
        : [...new Set([...wallet.map((c) => c.userId), ...bank.map((c) => c.userId)])].map(
            (userId) => ({
              userId,
              value:
                (wallet.find((c) => (c.userId = userId))?.value ?? 0) +
                (bank.find((c) => (c.userId = userId))?.value ?? 0)
            })
          )
    )
      .sort((a, b) => b.value - a.value)
      .filter((b) => b.value !== 0)

    const rank = balances.findIndex(
      (b) => b.value === balances.find((b) => b.userId === inter.user.id)?.value
    )

    const description =
      balances
        .map(
          (b, i) =>
            `**${balances.findIndex((v) => v.value === b.value) + 1}.** <@${b.userId}> - ${
              stat === 'activity' ? '✨' : '🪙'
            }${b.value}`
        )
        .join('\n') || 'There are currently no users in the leaderboard.'
    const embed = new EmbedBuilder()
      .setTitle(`${stat.replace(/\b\w/g, (c) => c.toUpperCase())} Leaderboard`)
      .setDescription(description)
      .setColor(inter.client.color)
    if (rank !== -1) embed.setFooter({ text: `Your rank: ${toOrdnial(rank + 1)}` })

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

    const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(select)

    if (inter.isMessageComponent()) await inter.update({ embeds: [embed], components: [row] })
    else await inter.reply({ embeds: [embed], components: [row] })
  }
}

export const leaderboard = new Leaderboard()

export class SortLeaderboard extends SelectMenu {
  name = 'sortLeaderboard'

  override async run(inter: SelectMenuInteraction) {
    await leaderboard.run(inter, inter.values[0])
  }
}
