import {
  Button,
  ChatInputCommand,
  DiscordException,
  MissingPermissions,
  Modal,
  SelectMenu
} from '../../core'
import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
  ModalBuilder,
  ModalSubmitInteraction,
  SelectMenuBuilder,
  SelectMenuInteraction,
  SelectMenuOptionBuilder,
  TextInputBuilder,
  TextInputStyle,
  Colors,
  ButtonBuilder,
  ButtonStyle,
  Interaction,
  ButtonInteraction
} from 'discord.js'
import mongoose from 'mongoose'
import { Inv } from '../../schemata/Inventory'
import { Item, IItem } from '../../schemata/Item'
import Wallet from '../../schemata/Wallet'

export class Shop extends ChatInputCommand {
  name = 'shop'
  description = 'Browse the shop'

  async run(inter: ChatInputCommandInteraction) {
    await inter.reply(await this.response(inter))
  }

  async response(inter: Interaction) {
    const items = await Item.find({ guildId: inter.guildId })

    const embed = new EmbedBuilder()
      .setTitle('Shop Items')
      .setColor(inter.client.color)
      .setDescription(
        items.length > 0
          ? items.map((i) => `${i.emoji} **${i.name}** - 🪙${i.price}\n${i.description}`).join('\n')
          : 'There are currently no items to be sold'
      )

    const menu = new SelectMenuBuilder()
      .setCustomId('shop')
      .setPlaceholder('Browse the shop')
      .addOptions(
        items.map((i) =>
          new SelectMenuOptionBuilder().setLabel(i.name).setValue(i.id).setEmoji(i.emoji)
        )
      )
      .setMinValues(0)

    if (inter.memberPermissions?.has('Administrator'))
      menu.addOptions(
        new SelectMenuOptionBuilder().setLabel('Add Item').setValue('add').setEmoji('💰')
      )

    const row = new ActionRowBuilder<SelectMenuBuilder>().setComponents(menu)

    return { embeds: [embed], components: [row] }
  }
}

export class ShopMenu extends SelectMenu {
  name = 'shop'

  override async run(inter: SelectMenuInteraction) {
    if (inter.values.length === 0) {
      await inter.update({})
      return
    }

    const v = inter.values[0]
    if (v === 'add') return await this.add(inter)
    else return await this.buy(inter, v)
  }

  async add(inter: SelectMenuInteraction) {
    const name = new TextInputBuilder()
      .setCustomId('name')
      .setLabel('Name')
      .setPlaceholder(`The name of this item`)
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)

    const price = new TextInputBuilder()
      .setCustomId('price')
      .setLabel('Price')
      .setPlaceholder(`The price of this item`)
      .setStyle(TextInputStyle.Short)
      .setMinLength(1)
      .setMaxLength(10)

    const desc = new TextInputBuilder()
      .setCustomId('desc')
      .setLabel('Description')
      .setPlaceholder(`The description of this item`)
      .setStyle(TextInputStyle.Paragraph)
      .setMinLength(1)

    const modal = new ModalBuilder()
      .setTitle('Add Item')
      .setCustomId('addItem')
      .setComponents(
        new ActionRowBuilder<TextInputBuilder>().setComponents(name),
        new ActionRowBuilder<TextInputBuilder>().setComponents(price),
        new ActionRowBuilder<TextInputBuilder>().setComponents(desc)
      )

    await inter.showModal(modal)
  }

  async buy(inter: SelectMenuInteraction, v: string) {
    const item = await Item.findById(v)
    if (!item) throw new DiscordException(`Item not found: \`${v}\``)

    const embed = new EmbedBuilder()
      .setTitle(`${item.emoji} ${item.name}`)
      .setDescription(item.description)
      .setColor(inter.client.color)

    const row = new ActionRowBuilder<ButtonBuilder>().setComponents(
      new ButtonBuilder().setCustomId('toShop').setEmoji('↩️').setStyle(ButtonStyle.Primary),
      new ButtonBuilder()
        .setCustomId(`buyItem-${v}`)
        .setLabel(`${item.price}`)
        .setEmoji('🪙')
        .setStyle(ButtonStyle.Primary)
    )

    if (inter.memberPermissions?.has('Administrator'))
      row.addComponents(
        new ButtonBuilder().setCustomId(`rmItem-${v}`).setEmoji('🗑️').setStyle(ButtonStyle.Danger)
      )
    await inter.update({ embeds: [embed], components: [row] })
  }
}

export class ShopButton extends Button {
  name = 'toShop'

  override async run(inter: ButtonInteraction) {
    await inter.update(await Shop.prototype.response(inter))
  }
}

export class BuyItem extends Button {
  name = 'buyItem'

  override async run(inter: ButtonInteraction, v: string) {
    const wallet = await Wallet.findOne({ guildId: inter.guildId, userId: inter.user.id })
    const inv = await Inv.findOneAndUpdate(
      { guildId: inter.guildId, userId: inter.user.id, item: new mongoose.Types.ObjectId(v) },
      {},
      { upsert: true, new: true }
    ).populate<{ item: IItem }>('item')

    const diff = inv.item.price - (wallet?.value ?? 0)
    if (diff > 0)
      throw new DiscordException(
        `You need 🪙${inv.item.price - (wallet?.value ?? 0)} more cash to buy ${inv.item.emoji} ${
          inv.item.name
        }.`
      )

    inv.amount++
    if (wallet) wallet.value -= inv.item.price
    await inv.save()
    await wallet?.save()

    const embed = new EmbedBuilder()
      .setDescription(`Bought 1 ${inv.item.emoji} ${inv.item.name}!`)
      .setColor(Colors.Green)
    await inter.reply({
      embeds: [embed],
      ephemeral: true
    })
  }
}

const emojiRegExp = /^(\p{Emoji}|<?a?:?\w{2,32}:\d{17,19}>?)\s*/u

export class AddItem extends Modal {
  name = 'addItem'

  override async run(inter: ModalSubmitInteraction) {
    if (!inter.memberPermissions?.has('Administrator'))
      throw new MissingPermissions('Administrator')

    const price = inter.fields.getTextInputValue('price')
    if (Number.isNaN(parseInt(price)))
      throw new DiscordException(`Couldn't convert \`${price}\` to number`)
    const name = inter.fields.getTextInputValue('name').replace(emojiRegExp, '')
    if (
      await Item.exists({
        guildId: inter.guildId,
        name: { $regex: `^${name}$`, $options: 'i' }
      })
    )
      throw new DiscordException(`${name} already exists`)
    const emoji = inter.fields.getTextInputValue('name').match(emojiRegExp)?.at(0)
    const description = inter.fields.getTextInputValue('desc')

    await Item.create({
      guildId: inter.guildId,
      name,
      price,
      description,
      emoji
    })

    const embed = new EmbedBuilder()
      .setTitle('Add Item')
      .setDescription(`**${name}** has been added for 🪙${price}`)
      .setColor(Colors.Green)

    if (!inter.isFromMessage()) {
      await inter.reply({
        embeds: [embed],
        ephemeral: true
      })
    } else {
      await inter.update(await Shop.prototype.response(inter))
      await inter.followUp({
        embeds: [embed],
        ephemeral: true
      })
    }
  }
}

export class RmItem extends Button {
  name = 'rmItem'

  override async run(inter: ButtonInteraction, v: string) {
    if (!inter.memberPermissions?.has('Administrator'))
      throw new MissingPermissions('Administrator')

    const item = await Item.findByIdAndDelete(v)

    if (!item) throw new DiscordException(`Item not found: ${v}`)
    await inter.update(await Shop.prototype.response(inter))

    const embed = new EmbedBuilder()
      .setTitle('Add Item')
      .setDescription(`**${item?.name}** has been removed from the shop`)
      .setColor(Colors.Green)

    await inter.followUp({
      embeds: [embed],
      ephemeral: true
    })
  }
}
