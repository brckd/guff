import { ChatInputCommand } from '../../core'
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder
} from 'discord.js'
import Wallet from '../../schemata/Wallet'
import Bank from '../../schemata/Bank'
import Xp from '../../schemata/Xp'

export class Set extends ChatInputCommand {
  name = 'set'
  description = "Set someone's stats"

  constructor() {
    super()
    this.defaultMemberPermissions = ['Administrator']
    this.options = ['wallet', 'bank', 'xp'].map((stat) => ({
      type: ApplicationCommandOptionType.Subcommand,
      name: stat,
      description: `Set someone's ${stat}`,
      options: [
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'value',
          description: `What to set the ${stat} to`,
          minValue: 0,
          required: true
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'target',
          description: `Whose ${stat} to set`
        }
      ]
    }))
  }

  override async run(inter: ChatInputCommandInteraction) {
    const stat = inter.options.getSubcommand() as 'wallet' | 'bank' | 'xp'
    const value = inter.options.getInteger('value')
    const target = inter.options.getUser('target', false) ?? inter.user

    const Collection = { wallet: Wallet, bank: Bank, xp: Xp }[stat]
    await Collection.findOneAndUpdate(
      { guildId: inter.guildId, userId: target.id },
      { $set: { value } },
      { upsert: true }
    )

    const embed = new EmbedBuilder()
      .setDescription(`Set ${target}'s ${stat} to **${value}**`)
      .setColor(Colors.Green)

    await inter.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}

export class Add extends ChatInputCommand {
  name = 'add'
  description = "Add to someone's stats"

  constructor() {
    super()
    this.defaultMemberPermissions = ['Administrator']
    this.options = ['wallet', 'bank', 'xp'].map((stat) => ({
      type: ApplicationCommandOptionType.Subcommand,
      name: stat,
      description: `Add to someone's ${stat}`,
      options: [
        {
          type: ApplicationCommandOptionType.Integer,
          name: 'amount',
          description: `How much to add to the ${stat}`,
          required: true
        },
        {
          type: ApplicationCommandOptionType.User,
          name: 'target',
          description: `Whose ${stat} to add to`
        }
      ]
    }))
  }

  override async run(inter: ChatInputCommandInteraction) {
    const stat = inter.options.getSubcommand() as 'wallet' | 'bank' | 'xp'
    const amount = inter.options.getInteger('amount', true)
    const target = inter.options.getUser('target', false) ?? inter.user

    const Collection = { wallet: Wallet, bank: Bank, xp: Xp }[stat]
    await Collection.findOneAndUpdate(
      { guildId: inter.guildId, userId: target.id },
      { $inc: { value: amount } },
      { upsert: true }
    )

    const embed = new EmbedBuilder()
      .setColor(Colors.Green)
      .setDescription(
        amount >= 0
          ? `Added **${amount}** to ${target}'s ${stat}`
          : `Removed **${-amount}** from ${target}'s ${stat}`
      )

    await inter.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}
