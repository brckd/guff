"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Give = exports.Withdraw = exports.Deposit = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
const Bank_1 = __importDefault(require("../../schemata/Bank"));
class Deposit extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'deposit';
        this.description = 'Deposit cash onto the bank';
        this.options = [
            {
                name: 'amount',
                description: 'The amount of cash you want to deposit',
                type: discord_js_1.ApplicationCommandOptionType.Integer
            }
        ];
    }
    async run(inter, amount) {
        const wallet = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        const bank = await Bank_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        if (!amount)
            amount = wallet.value;
        else if (amount > wallet.value)
            throw new core_1.DiscordException(`You cannot deposit more than 🪙${wallet.value}!`);
        wallet.value -= amount;
        bank.value += amount;
        await wallet.save();
        await bank.save();
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({
                    name: inter.user.username,
                    iconURL: inter.user.avatarURL() ?? undefined
                })
                    .setDescription(`Deposited 🪙${amount} to your bank!`)
                    .setColor(discord_js_1.Colors.Green)
            ]
        });
    }
}
exports.Deposit = Deposit;
class Withdraw extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'withdraw';
        this.description = 'Withdraw cash from the bank';
        this.options = [
            {
                name: 'amount',
                description: 'The amount of cash you want to withdraw',
                type: discord_js_1.ApplicationCommandOptionType.Integer
            }
        ];
    }
    async run(inter, amount) {
        const wallet = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        const bank = await Bank_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        if (!amount)
            amount = bank.value;
        else if (amount > bank.value)
            throw new core_1.DiscordException(`You cannot withdraw more than 🪙${bank.value}!`);
        bank.value -= amount;
        wallet.value += amount;
        await bank.save();
        await wallet.save();
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({
                    name: inter.user.username,
                    iconURL: inter.user.avatarURL() ?? undefined
                })
                    .setDescription(`Withdrew 🪙${amount} from your bank!`)
                    .setColor(discord_js_1.Colors.Green)
            ]
        });
    }
}
exports.Withdraw = Withdraw;
class Give extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'give';
        this.description = 'Give cash to someone';
        this.options = [
            {
                name: 'amount',
                description: 'The amount of cash you want to give',
                type: discord_js_1.ApplicationCommandOptionType.Integer,
                required: true
            },
            {
                name: 'target',
                description: 'Who you want to give the cash to',
                type: discord_js_1.ApplicationCommandOptionType.User
            }
        ];
        this.preconditions = ['GuildOnly'];
    }
    async run(inter, amount, target) {
        target ?? (target = inter.user);
        const from = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        const to = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: target.id }, {}, { upsert: true, new: true });
        if (amount > from.value)
            throw new core_1.DiscordException(`You cannot give more than 🪙${from.value}!`);
        to.value += amount;
        from.value -= amount;
        await to.save();
        await from.save();
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setAuthor({
                    name: inter.user.username,
                    iconURL: inter.user.avatarURL() ?? undefined
                })
                    .setDescription(`You gave 🪙${amount} to ${target}!`)
                    .setColor(discord_js_1.Colors.Green)
            ]
        });
    }
}
exports.Give = Give;
