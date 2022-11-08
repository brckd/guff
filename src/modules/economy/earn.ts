import { ChatInputCommand, Preconditions } from '../../core'
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js'
import ms from 'ms'
import Cash from '../../schemata/Wallet'

abstract class Earn extends ChatInputCommand {
  constructor() {
    super()
    this.preconditions = ['Cooldown']
  }

  abstract override cooldown: Preconditions['Cooldown']['cooldown']
  abstract profit: number
  abstract reply: string

  async run(inter: ChatInputCommandInteraction) {
    const profit = this.profit
    const balance = await Cash.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id },
      {},
      { upsert: true, new: true }
    )
    balance.value += profit
    await balance.save()

    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription(this.reply.replace('{profit}', profit.toString()))
          .setFooter({ text: `You now have 🪙${balance.value} in your wallet` })
          .setColor(inter.client.color)
      ]
    })
  }
}

export class Work extends Earn {
  name = 'work'
  description = 'Work to earn some money'
  cooldown = {
    delay: ms('1h')
  }

  minProfit = 4
  maxProfit = 7
  get profit() {
    return Math.round(this.minProfit + Math.random() * (this.maxProfit - this.minProfit))
  }

  reply = 'You worked and earned 🪙{profit}!'
}

export class Daily extends Earn {
  name = 'daily'
  description = 'Get your daily reward'
  cooldown = {
    delay: ms('1d')
  }

  profit = 5
  reply = 'You collected your daily 🪙{profit}!'
}

export class Weekly extends Daily {
  override name = 'weekly'
  override description = 'Get your weekly reward'
  override cooldown = {
    delay: ms('1w')
  }

  override profit = 10
  override reply = 'You collected your weekly 🪙{profit}!'
}

export class Monthly extends Daily {
  override name = 'monthly'
  override description = 'Get your monthly reward'
  override cooldown = {
    delay: ms('30d')
  }

  override profit = 15
  override reply = 'You collected your monthly 🪙{profit}!'
}
