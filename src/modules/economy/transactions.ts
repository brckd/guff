import { ChatInputCommand, DiscordException } from '../../core'
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  Colors,
  EmbedBuilder,
  User
} from 'discord.js'
import Wallet from '../../schemata/Wallet'
import Bank from '../../schemata/Bank'

export class Deposit extends ChatInputCommand {
  name = 'deposit'
  description = 'Deposit cash onto the bank'
  constructor() {
    super()
    this.options = [
      {
        name: 'amount',
        description: 'The amount of cash you want to deposit',
        type: ApplicationCommandOptionType.Integer
      }
    ]
  }

  async run(inter: ChatInputCommandInteraction, amount?: number) {
    const wallet = await Wallet.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )
    const bank = await Bank.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )

    if (!amount) amount = wallet.value
    else if (amount > wallet.value)
      throw new DiscordException(`You cannot deposit more than 🪙${wallet.value}!`)

    wallet.value -= amount
    bank.value += amount
    await wallet.save()
    await bank.save()

    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: inter.user.username,
            iconURL: inter.user.avatarURL() ?? undefined
          })
          .setDescription(`Deposited 🪙${amount} to your bank!`)
          .setColor(Colors.Green)
      ]
    })
  }
}

export class Withdraw extends ChatInputCommand {
  name = 'withdraw'
  description = 'Withdraw cash from the bank'
  constructor() {
    super()
    this.options = [
      {
        name: 'amount',
        description: 'The amount of cash you want to withdraw',
        type: ApplicationCommandOptionType.Integer
      }
    ]
  }

  async run(inter: ChatInputCommandInteraction, amount?: number) {
    const wallet = await Wallet.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )
    const bank = await Bank.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )

    if (!amount) amount = bank.value
    else if (amount > bank.value)
      throw new DiscordException(`You cannot withdraw more than 🪙${bank.value}!`)

    bank.value -= amount
    wallet.value += amount
    await bank.save()
    await wallet.save()

    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: inter.user.username,
            iconURL: inter.user.avatarURL() ?? undefined
          })
          .setDescription(`Withdrew 🪙${amount} from your bank!`)
          .setColor(Colors.Green)
      ]
    })
  }
}

export class Give extends ChatInputCommand {
  name = 'give'
  description = 'Give cash to someone'
  constructor() {
    super()
    this.options = [
      {
        name: 'amount',
        description: 'The amount of cash you want to give',
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: 'target',
        description: 'Who you want to give the cash to',
        type: ApplicationCommandOptionType.User
      }
    ]
    this.preconditions = ['GuildOnly']
  }

  async run(inter: ChatInputCommandInteraction, amount: number, target: User) {
    target ??= inter.user

    const from = await Wallet.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )
    const to = await Wallet.findOneAndUpdate(
      { guildId: inter.guildId, userId: target.id },
      {},
      { upsert: true, new: true }
    )

    if (amount > from.value)
      throw new DiscordException(`You cannot give more than 🪙${from.value}!`)

    to.value += amount
    from.value -= amount
    await to.save()
    await from.save()

    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setAuthor({
            name: inter.user.username,
            iconURL: inter.user.avatarURL() ?? undefined
          })
          .setDescription(`You gave 🪙${amount} to ${target}!`)
          .setColor(Colors.Green)
      ]
    })
  }
}
