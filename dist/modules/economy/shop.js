"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RmItem = exports.AddItem = exports.BuyItem = exports.ShopButton = exports.ShopMenu = exports.Shop = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const mongoose_1 = __importDefault(require("mongoose"));
const Inventory_1 = require("../../schemata/Inventory");
const Item_1 = require("../../schemata/Item");
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
class Shop extends core_1.ChatInputCommand {
    constructor() {
        super(...arguments);
        this.name = 'shop';
        this.description = 'Browse the shop';
    }
    async run(inter) {
        await inter.reply(await this.response(inter));
    }
    async response(inter) {
        const items = await Item_1.Item.find();
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Shop Items')
            .setColor(inter.client.color)
            .setDescription(items.length > 0
            ? items.map((i) => `${i.emoji} **${i.name}** - 🪙${i.price}\n${i.description}`).join('\n')
            : 'There are currently no items to be sold');
        const menu = new discord_js_1.SelectMenuBuilder()
            .setCustomId('shop')
            .setPlaceholder('Browse the shop')
            .addOptions(items.map((i) => new discord_js_1.SelectMenuOptionBuilder().setLabel(i.name).setValue(i.id).setEmoji(i.emoji)))
            .setMinValues(0);
        if (inter.memberPermissions?.has('Administrator'))
            menu.addOptions(new discord_js_1.SelectMenuOptionBuilder().setLabel('Add Item').setValue('add').setEmoji('💰'));
        const row = new discord_js_1.ActionRowBuilder().setComponents(menu);
        return { embeds: [embed], components: [row] };
    }
}
exports.Shop = Shop;
class ShopMenu extends core_1.SelectMenu {
    constructor() {
        super(...arguments);
        this.name = 'shop';
    }
    async run(inter) {
        if (inter.values.length === 0) {
            await inter.update({});
            return;
        }
        const v = inter.values[0];
        if (v === 'add')
            return await this.add(inter);
        else
            return await this.buy(inter, v);
    }
    async add(inter) {
        const name = new discord_js_1.TextInputBuilder()
            .setCustomId('name')
            .setLabel('Name')
            .setPlaceholder(`The name of this item`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setMinLength(1);
        const price = new discord_js_1.TextInputBuilder()
            .setCustomId('price')
            .setLabel('Price')
            .setPlaceholder(`The price of this item`)
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setMinLength(1)
            .setMaxLength(10);
        const desc = new discord_js_1.TextInputBuilder()
            .setCustomId('desc')
            .setLabel('Description')
            .setPlaceholder(`The description of this item`)
            .setStyle(discord_js_1.TextInputStyle.Paragraph)
            .setMinLength(1);
        const modal = new discord_js_1.ModalBuilder()
            .setTitle('Add Item')
            .setCustomId('addItem')
            .setComponents(new discord_js_1.ActionRowBuilder().setComponents(name), new discord_js_1.ActionRowBuilder().setComponents(price), new discord_js_1.ActionRowBuilder().setComponents(desc));
        await inter.showModal(modal);
    }
    async buy(inter, v) {
        const item = await Item_1.Item.findById(v);
        if (!item)
            throw new core_1.DiscordException(`Item not found: \`${v}\``);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${item.emoji} ${item.name}`)
            .setDescription(item.description)
            .setColor(inter.client.color);
        const row = new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder().setCustomId('toShop').setEmoji('↩️').setStyle(discord_js_1.ButtonStyle.Primary), new discord_js_1.ButtonBuilder()
            .setCustomId(`buyItem-${v}`)
            .setLabel(`${item.price}`)
            .setEmoji('🪙')
            .setStyle(discord_js_1.ButtonStyle.Primary));
        if (inter.memberPermissions?.has('Administrator'))
            row.addComponents(new discord_js_1.ButtonBuilder().setCustomId(`rmItem-${v}`).setEmoji('🗑️').setStyle(discord_js_1.ButtonStyle.Danger));
        await inter.update({ embeds: [embed], components: [row] });
    }
}
exports.ShopMenu = ShopMenu;
class ShopButton extends core_1.Button {
    constructor() {
        super(...arguments);
        this.name = 'toShop';
    }
    async run(inter) {
        await inter.update(await Shop.prototype.response(inter));
    }
}
exports.ShopButton = ShopButton;
class BuyItem extends core_1.Button {
    constructor() {
        super(...arguments);
        this.name = 'buyItem';
    }
    async run(inter, v) {
        const wallet = await Wallet_1.default.findOne({ guildId: inter.guildId, userId: inter.user.id });
        const inv = await Inventory_1.Inv.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id, item: new mongoose_1.default.Types.ObjectId(v) }, {}, { upsert: true, new: true }).populate('item');
        const diff = inv.item.price - (wallet?.value ?? 0);
        if (diff > 0)
            throw new core_1.DiscordException(`You need 🪙${inv.item.price - (wallet?.value ?? 0)} more cash to buy ${inv.item.emoji} ${inv.item.name}.`);
        inv.amount++;
        if (wallet)
            wallet.value -= inv.item.price;
        await inv.save();
        await wallet?.save();
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(`Bought 1 ${inv.item.emoji} ${inv.item.name}!`)
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.BuyItem = BuyItem;
const emojiRegExp = /^(\p{Emoji}|<?a?:?\w{2,32}:\d{17,19}>?)\s*/u;
class AddItem extends core_1.Modal {
    constructor() {
        super(...arguments);
        this.name = 'addItem';
    }
    async run(inter) {
        if (!inter.memberPermissions?.has('Administrator'))
            throw new core_1.MissingPermissions('Administrator');
        const price = inter.fields.getTextInputValue('price');
        if (Number.isNaN(parseInt(price)))
            throw new core_1.DiscordException(`Couldn't convert \`${price}\` to number`);
        const name = inter.fields.getTextInputValue('name').replace(emojiRegExp, '');
        if (await Item_1.Item.exists({
            guildId: inter.guildId,
            name: { $regex: `^${name}$`, $options: 'i' }
        }))
            throw new core_1.DiscordException(`${name} already exists`);
        const emoji = inter.fields.getTextInputValue('name').match(emojiRegExp)?.at(0);
        const description = inter.fields.getTextInputValue('desc');
        await Item_1.Item.create({
            guildId: inter.guildId,
            name,
            price,
            description,
            emoji
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Add Item')
            .setDescription(`✅ **${name}** has been added for 🪙${price}`)
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.AddItem = AddItem;
class RmItem extends core_1.Modal {
    constructor() {
        super(...arguments);
        this.name = 'rmItem';
    }
    async run(inter, v) {
        if (!inter.memberPermissions?.has('Administrator'))
            throw new core_1.MissingPermissions('Administrator');
        const item = await Item_1.Item.findByIdAndDelete(v);
        if (!item)
            throw new core_1.DiscordException(`Item not found: ${v}`);
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Add Item')
            .setDescription(`✅ **${item?.name}** has been removed from the shop`)
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.RmItem = RmItem;
