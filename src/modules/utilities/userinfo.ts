import { UserContextMenuCommand } from '../../core'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  GuildMember,
  Message,
  User,
  UserContextMenuCommandInteraction
} from 'discord.js'
import { stripIndents } from 'common-tags'
import ms from 'ms'

export class UserInfo extends UserContextMenuCommand {
  name = 'User Info'

  override async run(inter: UserContextMenuCommandInteraction, user: User) {
    let sent!: Message
    if (user.id === inter.client.user?.id)
      sent = await inter.reply({
        content: '*Pinging...*',
        fetchReply: true,
        ephemeral: true
      })

    await user.fetch(true)
    const embed = new EmbedBuilder()
      .addFields({
        name: 'General',
        value: stripIndents`
        > **Tag** - ${user.tag}
        > **ID** - \`${user.id}\`
        > **Created** - <t:${Math.floor(user.createdTimestamp / 1000)}:R>
        ${
          inter.targetMember instanceof GuildMember && inter.targetMember.joinedTimestamp
            ? `> **Joined** - <t:${Math.floor(inter.targetMember.joinedTimestamp / 1000)}:R>\n`
            : ''
        }\
        ${
          user.hexAccentColor
            ? `> **[Banner](${user.bannerURL()}) Color** - \`${user.hexAccentColor}\`\n`
            : ''
        }\
        > **[Avatar](${user.avatarURL()})**`
      })
      .setThumbnail(user.avatarURL())
      .setTitle(this.name)
      .setColor(inter.client.color)

    if (inter.targetMember instanceof GuildMember && inter.targetMember.roles.cache.size > 0)
      embed.addFields({
        name: `Roles (${inter.targetMember.roles.cache.size - 1})`,
        value: inter.targetMember.roles.cache
          .filter((r) => r.position > 0)
          .map((r) => `> ${r.toString()}`)
          .join('\n')
      })

    if (user.id === inter.client.user?.id)
      embed.addFields(
        {
          name: 'Cached',
          value: stripIndents`
          > **Servers** - ${inter.client.guilds.cache.size}
          > **Channels** - ${inter.client.channels.cache.size}
          > **Users** - ${inter.client.users.cache.size}`
        },
        {
          name: 'Responsiveness',
          value: stripIndents`
          > **Started** - <t:${Math.floor((Date.now() - inter.client.uptime) / 1000)}:R>
          > **Websocket heartbeat** - ${ms(inter.client.ws.ping)}
          > **Roundtrip latency** - ${ms(sent.createdTimestamp - inter.createdTimestamp)}`
        }
      )

    if (user.id !== inter.client.user?.id)
      await inter.reply({
        embeds: [embed],
        ephemeral: true
      })
    else
      await inter.editReply({
        content: null,
        embeds: [embed],
        components: [
          new ActionRowBuilder<ButtonBuilder>().setComponents(
            new ButtonBuilder()
              .setLabel('Invite')
              .setURL(inter.client.inviteURL)
              .setStyle(ButtonStyle.Link)
          )
        ]
      })
  }
}
