import { Listener } from '../../../core'
import { createCanvas, Image, loadImage } from 'canvas'
import { AttachmentBuilder, ClientEvents, EmbedBuilder, GuildMember, TextChannel } from 'discord.js'
import { join, resolve } from 'path'
import Guild from '../../../schemata/Guild'

function createImage({ back, avatar, caption }: { back: Image; avatar: Image; caption: string }) {
  const size = (back.width + back.height) / 2
  const margin = size * 0.05
  const av = {
    x: 0.5 * back.width,
    y: 0.4 * back.height,
    r: 0.35 * size * 0.5
  }
  const text = {
    content: caption,
    x: 0.5 * back.width,
    y: 0.8 * back.height,
    px: Math.round(size * 0.1),
    color: 'white'
  }

  const canvas = createCanvas(back.width, back.height)
  const ctx = canvas.getContext('2d')

  ctx.drawImage(back, 0, 0)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(margin, margin, back.width - 2 * margin, back.height - 2 * margin)
  ctx.save()

  ctx.beginPath()
  ctx.arc(av.x, av.y, av.r, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()
  ctx.drawImage(avatar, av.x - av.r, av.y - av.r, av.r * 2, av.r * 2)
  ctx.restore()

  ctx.fillStyle = 'white'
  ctx.textAlign = 'center'
  ctx.font = `${text.px}px Roboto`
  ctx.fillText(text.content, text.x, text.y)

  return canvas
}

export class Welcome extends Listener {
  event: keyof ClientEvents = 'guildMemberAdd'
  name = 'welcome'

  async run(member: GuildMember) {
    if (!member.guild.systemChannel) return
    const back = await loadImage(resolve(join(__dirname, '../../../../img/welcome.jpg')))
    const avatar = await loadImage(member.displayAvatarURL())
    const canvas = createImage({ back, avatar, caption: `Welcome ${member.displayName}` })

    const attachment = new AttachmentBuilder(canvas.toBuffer()).setName('image.png')
    const embed = new EmbedBuilder()
      .setDescription(`Welcome ${member} to **${member.guild.name}**!`)
      .setColor(member.client.color)
      .setImage('attachment://image.png')

    const channelId = (await Guild.findOne({ id: member.guild.id }))?.welcomeChannel
    const fetched = channelId ? await member.client.channels.fetch(channelId) : null
    if (channelId) await member.client.channels.fetch(channelId)
    const channel = fetched instanceof TextChannel ? fetched : member.guild.systemChannel

    const sent = await channel.send({
      embeds: [embed],
      files: [attachment]
    })

    await sent.react('👋')
  }
}

export class GoodBye extends Listener {
  event: keyof ClientEvents = 'guildMemberRemove'
  name = 'goodbye'

  async run(member: GuildMember) {
    if (!member.guild.systemChannel) return
    const back = await loadImage(resolve(join(__dirname, '../../../../img/goodbye.jpg')))
    const avatar = await loadImage(member.displayAvatarURL())
    const canvas = createImage({ back, avatar, caption: `Goodbye, ${member.nickname}` })

    const attachment = new AttachmentBuilder(canvas.toBuffer()).setName('image.png')
    const embed = new EmbedBuilder()
      .setDescription(`Goodbye, ${member} 👋`)
      .setColor(member.client.color)
      .setImage('attachment://image.png')

    const channelId = (await Guild.findOne({ id: member.guild.id }))?.welcomeChannel
    const fetched = channelId ? await member.client.channels.fetch(channelId) : null
    if (channelId) await member.client.channels.fetch(channelId)
    const channel = fetched instanceof TextChannel ? fetched : member.guild.systemChannel

    const sent = await channel.send({
      embeds: [embed],
      files: [attachment]
    })

    await sent.react('👋')
  }
}
