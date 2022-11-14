import { Button, DiscordException, MessageContextMenuCommand, SelectMenu } from '../../core'
import { stripIndents } from 'common-tags'
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  GuildMember,
  MessageContextMenuCommandInteraction,
  PermissionsBitField,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder,
  TextChannel
} from 'discord.js'

const emojis = [
  [[0xe6, 0xe7, 0xe8], '⚪'],
  [[0x31, 0x37, 0x3d], '⚫'],
  [[0xdd, 0x2e, 0x44], '🔴'],
  [[0x55, 0xac, 0xee], '🔵'],
  [[0xc1, 0x69, 0x4f], '🟤'],
  [[0xaa, 0x8e, 0xd6], '🟣'],
  [[0x78, 0xb1, 0x59], '🟢'],
  [[0xfd, 0xcb, 0x58], '🟡'],
  [[0xf4, 0x90, 0x0c], '🟠']
] as const

function colorEmoji(color: number) {
  const c = [Math.floor(color / 65536), Math.floor(color / 256) % 256, color % 256]
  let min = Infinity
  let emoji!: typeof emojis[number][1]
  for (const [c2, e] of emojis) {
    const dist = (c[0] - c2[0]) ** 2 + (c[1] - c2[1]) ** 2 + (c[2] - c2[2]) ** 2
    if (min < dist) continue
    min = dist
    emoji = e
  }
  return emoji
}

class Roles extends MessageContextMenuCommand {
  name = 'Roles'
  constructor() {
    super()
    this.clientPermissions = ['ManageRoles', 'ManageMessages', 'ManageWebhooks']
    this.defaultMemberPermissions = new PermissionsBitField(['ManageRoles', 'ManageMessages'])
    this.preconditions = ['GuildOnly', 'ClientPermissions']
  }

  override async run(
    inter: MessageContextMenuCommandInteraction | ButtonInteraction,
    message: { id: string },
    i = 0
  ) {
    const roles = inter.guild?.roles.cache
      .filter(
        (r) =>
          r.position > 0 &&
          (inter.member as GuildMember).roles.highest.position > r.position &&
          (inter.guild?.members.me?.roles.highest.position ?? 0) > r.position
      )
      .sort((a, b) => a.position - b.position)

    if (!roles) throw new DiscordException('No roles to ')
    i = Math.min(Math.max(i, 0), Math.floor(roles.size / 25))
    const menu = new ActionRowBuilder<SelectMenuBuilder>().setComponents(
      new SelectMenuBuilder()
        .setCustomId(`setRoles-${message.id}`)
        .setPlaceholder('Set roles')
        .setOptions(
          roles
            .map((r) =>
              new SelectMenuOptionBuilder()
                .setLabel(r.name)
                .setValue(r.id)
                .setEmoji(colorEmoji(r.color))
            )
            .slice(25 * i, 25 * i + 25)
        )
        .setMaxValues(Math.min(roles.size - 25 * i, 25))
    )
    const paginator = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`toRoles-${message.id}-${i}-prev`)
        .setEmoji('◀️')
        .setDisabled(i <= 0),
      new ButtonBuilder()
        .setStyle(ButtonStyle.Secondary)
        .setCustomId(`toRoles-${message.id}-${i}-next`)
        .setEmoji('▶️')
        .setDisabled(i >= Math.floor(roles.size / 25))
    )

    if (inter.isMessageComponent()) await inter.update({ components: [menu, paginator] })
    else
      await inter.reply({
        components: [menu, paginator],
        ephemeral: true
      })
  }
}

export const roles = new Roles()

export class toRoles extends Button {
  name: string = 'toRoles'

  override async run(inter: ButtonInteraction, messageId: string, i: string, to: 'prev' | 'next') {
    await roles.run(inter, { id: messageId }, to === 'prev' ? parseInt(i) - 1 : parseInt(i) + 1)
  }
}

export class SetRoles extends SelectMenu {
  name: string = 'setRoles'

  override async run(inter: SelectMenuInteraction, messageId: string) {
    const message = await inter.channel?.messages.fetch(messageId)
    if (!message) return

    const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(
      new SelectMenuBuilder()
        .setCustomId('roles')
        .setPlaceholder('Toggle your roles')
        .addOptions(
          new SelectMenuOptionBuilder()
            .setLabel('Remove All Roles')
            .setValue('remove')
            .setEmoji('🗑️')
        )
        .addOptions(
          await Promise.all(
            inter.values.map(async (v) => {
              const r = await inter.guild?.roles.fetch(v)
              return new SelectMenuOptionBuilder()
                .setLabel(r?.name ?? '')
                .setValue(v)
                .setEmoji(colorEmoji(r?.color ?? 0))
            })
          )
        )
        .setMinValues(0)
        .setMaxValues(inter.values.length + 1)
    )

    const webhook = await inter.client.provideWebhook(inter.channel as TextChannel)

    await webhook.send({
      username: message.author.username,
      avatarURL: message.author.avatarURL() ?? undefined,
      content: message.content,
      embeds: message.embeds,
      components: [row]
    })

    const embed = new EmbedBuilder()
      .setDescription(
        stripIndents`Added roles: ${await Promise.all(
          inter.values.map((v) => `\n> ${inter.guild?.roles.cache.get(v)}`)
        )}`
      )
      .setTitle('Roles')
      .setColor(Colors.Green)

    await message.delete()
    await inter.update({
      embeds: [embed],
      components: []
    })
  }
}

export class RolesMenu extends SelectMenu {
  name: string = 'roles'

  override async run(inter: SelectMenuInteraction) {
    if (!(inter.member instanceof GuildMember)) return

    const embed = new EmbedBuilder().setTitle('Roles').setColor(inter.client.color)

    const values = inter.values.filter((v) => v !== 'remove')

    if (inter.values.includes('remove'))
      for (const o of inter.component.options)
        if (o.value !== 'remove') await inter.member.roles.remove(o.value)

    if (!inter.member.roles.cache.hasAll(...values))
      embed.addFields({
        name: 'Added',
        value: (
          await Promise.all(
            values
              .filter((v) => !(inter.member as GuildMember).roles.cache.has(v))
              .map(async (v) => `> <@&${v}>`)
          )
        ).join('\n')
      })

    if (inter.member.roles.cache.hasAny(...values))
      embed.addFields({
        name: 'Removed',
        value: inter.member.roles.cache
          .filter((r) => values.includes(r.id))
          .map((r) => `> ${r}`)
          .join('\n')
      })

    for (const v of values)
      if (!inter.member.roles.cache.has(v)) await inter.member.roles.add(v)
      else await inter.member.roles.remove(v)

    if (!embed.data.fields) await inter.update({})
    else
      await inter.reply({
        embeds: [embed],
        ephemeral: true
      })
  }
}
