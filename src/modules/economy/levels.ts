import { Listener } from '../../core'
import { ClientEvents, EmbedBuilder, Message } from 'discord.js'
import Xp from '../../schemata/Xp'

export function toLvl(xp: number) {
  return Math.floor(xp ** 0.5)
}

export function toXp(lvl: number) {
  return Math.floor(lvl) ** 2
}

export async function levelUp(inter: Message, before: number, after: number) {
  if (toLvl(after) <= toLvl(before)) return
  const embed = new EmbedBuilder()
    .setDescription(`${inter.author} has reached lvl 🏆**${toLvl(after)}**!`)
    .setFooter({
      text: `Collect ✨${toXp(toLvl(after) + 1) - after} more xp for lvl 🏆${toLvl(after) + 1}`
    })
    .setColor(inter.client.color)

  await inter.channel.send({
    embeds: [embed]
  })
}

export class XP extends Listener {
  name: string = 'xp'
  event: keyof ClientEvents = 'messageCreate'

  override async run(msg: Message) {
    if (!msg.inGuild()) return
    if (msg.author.bot) return

    const xp = await Xp.findOneAndUpdate(
      { guildId: msg.guildId, userId: msg.author.id },
      {},
      { upsert: true, new: true }
    )
    await levelUp(msg, xp.value, ++xp.value)
    await xp.save()
  }
}
