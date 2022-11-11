import { ClientMissingPermissions, MessageContextMenuCommand, MissingPermissions } from '../../core'
import {
  Colors,
  EmbedBuilder,
  Message,
  MessageContextMenuCommandInteraction,
  PermissionFlagsBits
} from 'discord.js'

export class Delete extends MessageContextMenuCommand {
  name = 'Delete'
  override async run(inter: MessageContextMenuCommandInteraction, message: Message) {
    if (!message.deletable) throw new ClientMissingPermissions('ManageMessages')

    await (async () => {
      if (!inter.inGuild()) return // DM
      if (inter.user.id === message.author.id) return // own message
      if (message.author.bot && inter.user.id === message.interaction?.user.id) return // application command
      if (
        message.author.bot &&
        message.reference?.messageId &&
        inter.user.id ===
          (await inter.channel?.messages.fetch(message.reference.messageId))?.author.id
      )
        return // text command
      if (inter.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) return // has ManageMessages permission

      throw new MissingPermissions('ManageMessages')
    })()

    await message.delete()
    await inter.reply({
      embeds: [
        new EmbedBuilder()
          .setDescription('Message has successfully been deleted')
          .setColor(Colors.Green)
      ],
      ephemeral: true
    })
  }
}
