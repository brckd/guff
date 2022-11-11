import { ChatInputCommand, MessageContextMenuCommand, Modal } from '../../core'
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  Colors,
  CommandInteraction,
  EmbedBuilder,
  GuildMember,
  Message,
  MessageContextMenuCommandInteraction,
  ModalBuilder,
  ModalSubmitInteraction,
  TextChannel,
  TextInputBuilder,
  TextInputStyle
} from 'discord.js'

export class Format extends ChatInputCommand {
  name = 'format'
  description = 'Format your text'

  constructor() {
    super()
    this.options = [
      {
        type: ApplicationCommandOptionType.String,
        name: 'text',
        description: 'The text to format',
        required: true
      }
    ]
    this.clientPermissions = ['ManageWebhooks']
    this.preconditions = ['ClientPermissions', 'GuildOnly']
  }

  override async run(inter: CommandInteraction, text: string) {
    const domainChars = 'a-zA-Z0-9@%._\\\\+~#?&='
    const urlChars = domainChars + ':/'
    const url = `[${domainChars}]{2,256}\\.[${domainChars}]{2,6}/?[${urlChars}]*`
    const hyperLink = ['\\[.*\\]\\(', '\\)']

    text = text.replace(
      new RegExp(`(?<![${urlChars}]|${hyperLink[0]})${url}`, 'g'),
      (s) => `[${s}](https://${s})`
    ) // create hyperlinks
    text = text.replace(
      new RegExp(`(?<=${hyperLink[0]})${url}(?=${hyperLink[1]})`, 'g'),
      (s) => `https://${s}`
    ) // complete existing hyperlinks

    const webhook = await inter.client.provideWebhook(inter.channel as TextChannel)

    await webhook.send({
      content: text,
      username:
        inter.member instanceof GuildMember ? inter.member.displayName : inter.user.username,
      avatarURL:
        inter.member instanceof GuildMember
          ? inter.member.displayAvatarURL()
          : inter.user.avatarURL() ?? undefined
    })

    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setTitle(this.name.replace(/\b\w/g, (c) => c.toUpperCase()))
          .setDescription('Message has been formatted!')
          .setColor(inter.client.color)
      ],
      ephemeral: true
    })
  }
}

export class Reply extends MessageContextMenuCommand {
  name = 'Reply'

  constructor() {
    super()
    this.clientPermissions = ['ManageWebhooks']
    this.preconditions = ['ClientPermissions', 'GuildOnly']
  }

  async run(inter: MessageContextMenuCommandInteraction, message: Message) {
    const content = new TextInputBuilder()
      .setCustomId('content')
      .setLabel(`Replying to ${message.author.username}`)
      .setPlaceholder(`Message #${(message.channel as TextChannel).name}`)
      .setMinLength(1)
      .setStyle(TextInputStyle.Paragraph)

    const modal = new ModalBuilder()
      .setTitle(this.name)
      .setCustomId(`reply-${message.id}`)
      .setComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(content))

    await inter.showModal(modal)
  }
}

export class ReplyModal extends Modal {
  name = 'reply'

  async run(inter: ModalSubmitInteraction, messageId: string) {
    const message = await inter.channel?.messages.fetch(messageId)
    if (message == null) throw new Error('Message not found!')

    const webhook = await inter.client.provideWebhook(inter.channel as TextChannel)

    const reference = new EmbedBuilder()
      .setAuthor({
        name: message.author.username,
        url: message.url,
        iconURL: message.author.displayAvatarURL()
      })
      .setDescription(
        message.content ||
          // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
          message.embeds[0].description ||
          message.embeds[0].fields[0].value ||
          '*embedded content*'
      )
      .setColor('#4f545c')

    await webhook.send({
      content: inter.fields.getTextInputValue('content'),
      embeds: [reference],
      username:
        inter.member instanceof GuildMember ? inter.member.displayName : inter.user.username,
      avatarURL:
        inter.member instanceof GuildMember
          ? inter.member.displayAvatarURL()
          : inter.user.avatarURL() ?? undefined
    })

    const embed = new EmbedBuilder()
      .setTitle('Reply')
      .setDescription('Reply has been sent')
      .setColor(Colors.Green)

    await inter.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}
