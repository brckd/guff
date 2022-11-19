import { ChatInputCommand, Listener, SelectMenu } from '../../core'
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  ClientEvents,
  Colors,
  EmbedBuilder,
  inlineCode,
  Message,
  MessageType,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder
} from 'discord.js'
import Filter from '../../schemata/Filter'
import { oneLineCommaListsOr } from 'common-tags'

class FilterCommand extends ChatInputCommand {
  name = 'filter'
  description = 'Filter messages in this channel'
  constructor() {
    super()
    this.clientPermissions = ['ManageMessages']
    this.defaultMemberPermissions = ['ManageChannels']
    this.preconditions = ['GuildOnly', 'ClientPermissions']
  }

  media = [
    { id: 'images', emoji: '🖼️' },
    { id: 'videos', emoji: '🎞️' },
    { id: 'audio', emoji: '🔊' }
  ] as const

  override async run(inter: ChatInputCommandInteraction | SelectMenuInteraction) {
    const filter = await Filter.findOneAndUpdate(
      { channelId: inter.channelId },
      {},
      { upsert: true, new: true }
    )

    const mediaFilter = new SelectMenuBuilder()
      .setCustomId(`mediaFilters-${filter.id}`)
      .setPlaceholder('Media Filters')
      .setMinValues(0)
      .setMaxValues(this.media.length)
      .setOptions(
        this.media.map((m) =>
          new SelectMenuOptionBuilder()
            .setLabel(m.id.replace(/\b\w/g, (c) => c.toUpperCase()))
            .setValue(m.id)
            .setEmoji(m.emoji)
            .setDefault(filter[m.id] ?? false)
        )
      )
    const media = new ActionRowBuilder<SelectMenuBuilder>().setComponents(mediaFilter)

    if (inter.isMessageComponent())
      await inter.update({
        components: [media]
      })
    else
      await inter.reply({
        components: [media],
        ephemeral: true
      })
  }
}

export const filterCommand = new FilterCommand()

export class MediaFilters extends SelectMenu {
  name = 'mediaFilters'

  override async run(inter: SelectMenuInteraction, id: string) {
    const filter = await Filter.findById(id)
    if (!filter) return

    for (const m of filterCommand.media) filter[m.id] = inter.values.includes(m.id)
    await filter.save()

    await filterCommand.run(inter)
  }
}

export class FilterMessages extends Listener {
  name: string = 'filterMessages'
  event: keyof ClientEvents = 'messageCreate'

  override async run(msg: Message) {
    if (!msg.deletable) return
    if (![MessageType.Default, MessageType.Reply].includes(msg.type)) return
    if (!(await Filter.exists({ channelId: msg.channelId }))) return
    await this.checkMedia(msg)
  }

  async checkMedia(msg: Message) {
    const filter = await Filter.findOne({ channelId: msg.channelId })
    if (!filter) return
    if (!filter.images && !filter.videos && !filter.audio) return

    if (filter.images)
      if (
        msg.attachments.some((a) => a.contentType?.startsWith('image')) ||
        msg.embeds.some((e) => e.image)
      )
        return

    if (filter.videos)
      if (
        msg.attachments.some((a) => a.contentType?.startsWith('video')) ||
        msg.embeds.some((e) => e.video)
      )
        return

    if (filter.audio) if (msg.attachments.some((a) => a.contentType?.startsWith('audio'))) return

    await msg.delete()

    const media = filterCommand.media.filter((m) => filter[m.id]).map((m) => inlineCode(m.id))
    const embed = new EmbedBuilder()
      .setDescription(
        oneLineCommaListsOr`Your message in <#${msg.channelId}> has been deleted, because it doesn't contain any ${media}.`
      )
      .setColor(Colors.Red)

    await msg.author.send({
      embeds: [embed]
    })
  }
}
