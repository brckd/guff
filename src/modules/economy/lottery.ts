import { Button, ChatInputCommand, DiscordException, MissingPermissions, Modal } from '../../core'
import {
  ChatInputCommandInteraction,
  ActionRowBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ButtonInteraction,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ModalSubmitInteraction,
  Colors
} from 'discord.js'
import Lottery from '../../schemata/Lottery'
import Wallet from '../../schemata/Wallet'

export class LotteryCommand extends ChatInputCommand {
  name = 'lottery'
  description = 'Start a new Lottery'

  constructor() {
    super()
    this.defaultMemberPermissions = ['Administrator']
  }

  override async run(inter: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder()
      .setTitle('New Lottery')
      .setDescription(
        'A new lottery has started!\nMake sure to submit your guess using the button ` 🎫 ` below'
      )
      .setColor(inter.client.color)

    const submit = new ButtonBuilder()
      .setCustomId(`lotterySubmit-${inter.id}`)
      .setEmoji('🎫')
      .setStyle(ButtonStyle.Primary)
    const startLottery = new ButtonBuilder()
      .setCustomId(`startLottery-${inter.id}`)
      .setEmoji('📯')
      .setStyle(ButtonStyle.Secondary)
    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(submit, startLottery)

    await inter.reply({
      content: '<@&1008402847622242416>',
      embeds: [embed],
      components: [row]
    })
  }
}

export class Submit extends Button {
  name = 'lotterySubmit'

  override async run(inter: ButtonInteraction, id: string) {
    const submission = new TextInputBuilder()
      .setCustomId('submission')
      .setLabel('Submission')
      .setPlaceholder('Submit 3 unique numbers from 1 to 9')
      .setStyle(TextInputStyle.Short)
      .setMinLength(3)
      .setMaxLength(3)
    const row = new ActionRowBuilder<TextInputBuilder>().setComponents(submission)
    const modal = new ModalBuilder()
      .setCustomId(`lotterySubmission-${id}`)
      .setTitle('Submit')
      .setComponents(row)

    await inter.showModal(modal)
  }
}

export class Submission extends Modal {
  name = 'lotterySubmission'

  override async run(inter: ModalSubmitInteraction, lotteryId: string) {
    const submission = inter.fields.getTextInputValue('submission').split('').sort().join('')
    if (!submission.match(/^[1-9]{3}$/))
      throw new DiscordException('Please provide 3 **valid** numbers from 1 to 9!')

    if (new Set(submission).size < submission.length)
      throw new DiscordException('Please provide 3 **unique** numbers from 1 to 9!')

    if (
      await Lottery.exists({
        lotteryId,
        userId: { $not: { $eq: inter.user.id } },
        value: submission
      })
    )
      throw new DiscordException(`🎫**${submission}** has already been submitted by someone else`)

    await Lottery.findOneAndUpdate(
      { lotteryId, userId: inter.user.id },
      { value: submission },
      { upsert: true }
    )

    const embed = new EmbedBuilder()
      .setTitle('Your Submission')
      .setDescription(
        `You've submitted 🎫**${submission}**! You can also use the button \` 🎫 \` to change your submission.`
      )
      .setColor(Colors.Green)

    await inter.reply({
      embeds: [embed],
      ephemeral: true
    })

    if (!inter.message?.embeds) throw new Error("Couldn't find lottery announcement message")
    const e = EmbedBuilder.from(inter.message.embeds[0])
    const submissions = (await Lottery.find({ lotteryId })).map(
      (s) => `<@${s.userId}> - 🎫**${s.value}**`
    )
    e.setFields({ name: 'Submissions', value: submissions.join('\n') })
    e.setFooter({ text: `Total submissions: ${submissions.length}` })
    await inter.message?.edit({ embeds: [e] })
  }
}

export class Start extends Button {
  name = 'startLottery'
  prize = 1000

  override async run(inter: ButtonInteraction, lotteryId: string) {
    if (!inter.memberPermissions?.has('Administrator'))
      throw new MissingPermissions('Administrator')

    const choices = Array.from({ length: 9 }, (v, k) => `${k + 1}`)
    const samples = []
    for (let i = 0; i < 3; i++) samples.push(choices.splice(Math.random() * choices.length, 1)[0])
    const value = samples.sort().join('')

    const match = await Lottery.findOne({ lotteryId, value })
    if (match) {
      const wallet = await Wallet.findOneAndUpdate(
        { guildId: inter.guildId, userId: match?.userId },
        {},
        { upsert: true, new: true }
      )
      wallet.value += this.prize
      await wallet.save()
    }
    const description = match
      ? `<@${match.userId}> has won and won 🪙${this.prize}`
      : 'Noone has won. Good luck next time!'
    const result = Array.from(
      { length: 9 },
      (v, k) =>
        `${
          value.includes(`${k + 1}`)
            ? '<:guffo_coin:888125079710474280>'
            : '<:COOKIE:888125079395921971>'
        }${(k + 1) % 3 === 0 ? '\n' : ''}`
    ).join('')

    const embed = EmbedBuilder.from(inter.message.embeds[0])
      .setTitle('Lottery is Over')
      .setDescription(description)
      .spliceFields(0, 0, { name: `Result (${value.split('').join(', ')})`, value: result })
      .setColor(Colors.Green)

    await inter.update({
      embeds: [embed],
      components: []
    })

    await Lottery.deleteMany({ lotteryId })
  }
}
