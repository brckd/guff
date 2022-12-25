import { Button, ChatInputCommand } from '../../core'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  User
} from 'discord.js'
import Wallet from '../../schemata/Wallet'
import Bank from '../../schemata/Bank'
import Xp from '../../schemata/Xp'
import { toLvl, toXp } from './levels'
import { Inv } from '../../schemata/Inventory'
import { IItem } from '../../schemata/Item'

export class Stats extends ChatInputCommand {
  name = 'stats'
  description = "Show someone's stats"

  constructor() {
    super()
    this.options = [
      {
        name: 'target',
        description: 'Who you want to see the stats of',
        type: ApplicationCommandOptionType.User
      },
      {
        name: 'stat',
        description: 'The stat to show',
        type: ApplicationCommandOptionType.String,
        choices: [
          {
            name: 'cash',
            value: 'cash'
          },
          {
            name: 'activity',
            value: 'activity'
          },
          {
            name: 'inv',
            value: 'inv'
          }
        ]
      }
    ]
  }

  override async run(
    inter: ChatInputCommandInteraction | ButtonInteraction,
    target: User,
    type?: 'cash' | 'activity' | 'inv'
  ) {
    type ??= 'cash'
    target ??= inter.user

    const embed = new EmbedBuilder()
      .setAuthor({
        name: target.username,
        iconURL: target.avatarURL() ?? undefined
      })
      .setColor(inter.client.color)

    switch (type) {
      case 'activity': {
        const xp = (await Xp.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0
        const xpDiff = toXp(toLvl(xp) + 1) - toXp(toLvl(xp))
        embed.addFields(
          {
            name: 'Xp',
            value: `✨${xp}`,
            inline: true
          },
          {
            name: 'Level',
            value: `🏆${toLvl(xp)}`,
            inline: true
          },
          {
            name: 'Progress',
            value: `\`${xpDiff - (toXp(toLvl(xp) + 1) - xp)}/${xpDiff}xp for 🏆${toLvl(xp) + 1}\``
          }
        )
        break
      }
      case 'cash': {
        const wallet =
          (await Wallet.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0
        const bank = (await Bank.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0
        embed.addFields(
          {
            name: 'Wallet',
            value: `🪙${wallet}`,
            inline: true
          },
          {
            name: 'Bank',
            value: `🪙${bank}`,
            inline: true
          },
          {
            name: 'Total',
            value: `🪙${wallet + bank}`,
            inline: true
          }
        )
        break
      }
      case 'inv': {
        const invs = await Inv.find({ guildId: inter.guildId, userId: target.id }).populate<{
          item: IItem
        }>('item')
        embed.setDescription(
          invs
            .filter((i) => i.item && i.amount !== 0)
            .map((i) => `${i.item.emoji} **${i.item.name}** - ${i.amount}\n${i.item.description}`)
            .join('\n') || "This user doesn't own any items."
        )
      }
    }

    const buttons = [
      ['cash', '🪙'],
      ['activity', '📊'],
      ['inv', '💼']
    ].map(([id, e]) =>
      new ButtonBuilder()
        .setCustomId(`stats-${id}-${target.id}`)
        .setEmoji(e)
        .setDisabled(id === type)
        .setStyle(id === type ? ButtonStyle.Primary : ButtonStyle.Secondary)
    )
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(buttons)

    if (inter.isButton())
      await inter.update({
        embeds: [embed],
        components: [row]
      })
    else
      await inter.reply({
        embeds: [embed],
        components: [row]
      })
  }
}
export const stats = new Stats()

export class StatsButton extends Button {
  name: string = 'stats'

  override async run(inter: ButtonInteraction, type: 'cash' | 'activity', target: string) {
    await stats.run(inter, await inter.client.users.fetch(target), type)
  }
}
