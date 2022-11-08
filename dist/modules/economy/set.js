"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Add = exports.Set = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
const Bank_1 = __importDefault(require("../../schemata/Bank"));
const Xp_1 = __importDefault(require("../../schemata/Xp"));
class Set extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'set';
        this.description = "Set someone's stats";
        this.defaultMemberPermissions = ['Administrator'];
        this.options = ['wallet', 'bank', 'xp'].map((stat) => ({
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: stat,
            description: `Set someone's ${stat}`,
            options: [
                {
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    name: 'value',
                    description: `What to set the ${stat} to`,
                    minValue: 0,
                    required: true
                },
                {
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    name: 'target',
                    description: `Whose ${stat} to set`
                }
            ]
        }));
    }
    async run(inter) {
        const stat = inter.options.getSubcommand();
        const value = inter.options.getInteger('value');
        const target = inter.options.getUser('target', false) ?? inter.user;
        const Collection = { wallet: Wallet_1.default, bank: Bank_1.default, xp: Xp_1.default }[stat];
        await Collection.findOneAndUpdate({ guildId: inter.guildId, userId: target.id }, { $set: { value } }, { upsert: true });
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(`Set ${target}'s ${stat} to **${value}**`)
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.Set = Set;
class Add extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'add';
        this.description = "Add to someone's stats";
        this.defaultMemberPermissions = ['Administrator'];
        this.options = ['wallet', 'bank', 'xp'].map((stat) => ({
            type: discord_js_1.ApplicationCommandOptionType.Subcommand,
            name: stat,
            description: `Add to someone's ${stat}`,
            options: [
                {
                    type: discord_js_1.ApplicationCommandOptionType.Integer,
                    name: 'amount',
                    description: `How much to add to the ${stat}`,
                    required: true
                },
                {
                    type: discord_js_1.ApplicationCommandOptionType.User,
                    name: 'target',
                    description: `Whose ${stat} to add to`
                }
            ]
        }));
    }
    async run(inter) {
        const stat = inter.options.getSubcommand();
        const amount = inter.options.getInteger('amount', true);
        const target = inter.options.getUser('target', false) ?? inter.user;
        const Collection = { wallet: Wallet_1.default, bank: Bank_1.default, xp: Xp_1.default }[stat];
        await Collection.findOneAndUpdate({ guildId: inter.guildId, userId: target.id }, { $inc: { value: amount } }, { upsert: true });
        const embed = new discord_js_1.EmbedBuilder()
            .setColor(discord_js_1.Colors.Green)
            .setDescription(amount >= 0
            ? `Added **${amount}** to ${target}'s ${stat}`
            : `Removed **${-amount}** from ${target}'s ${stat}`);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.Add = Add;
