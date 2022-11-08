"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortLeaderboard = exports.leaderboard = exports.toOrdnial = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
const Bank_1 = __importDefault(require("../../schemata/Bank"));
const Xp_1 = __importDefault(require("../../schemata/Xp"));
function toOrdnial(n) {
    return `${n}${['st', 'nd', 'rd'][((((n + 90) % 100) - 10) % 10) - 1] || 'th'}`;
}
exports.toOrdnial = toOrdnial;
class Leaderboard extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'leaderboard';
        this.description = 'List all members ranked by stats';
        this.emojis = new discord_js_1.Collection()
            .set('total', '🪙')
            .set('wallet', '👛')
            .set('bank', '🏦')
            .set('activity', '📊');
        this.options = [
            {
                name: 'stat',
                description: 'The stat to sort the leaderboard for',
                type: discord_js_1.ApplicationCommandOptionType.String,
                choices: this.emojis.map((v, k) => ({
                    name: k.replace(/\b\w/g, (c) => c.toUpperCase()).replace('Xp', 'XP'),
                    value: k,
                    type: discord_js_1.ApplicationCommandOptionType
                }))
            }
        ];
    }
    async run(inter, stat) {
        stat ?? (stat = 'total');
        const wallet = await Wallet_1.default.find({ guildId: inter.guildId });
        const bank = await Bank_1.default.find({ guildId: inter.guildId });
        const xp = await Xp_1.default.find({ guildId: inter.guildId });
        const balances = (stat === 'wallet'
            ? wallet
            : stat === 'bank'
                ? bank
                : stat === 'activity'
                    ? xp
                    : [...new Set([...wallet.map((c) => c.userId), ...bank.map((c) => c.userId)])].map((userId) => ({
                        userId,
                        value: (wallet.find((c) => (c.userId = userId))?.value ?? 0) +
                            (bank.find((c) => (c.userId = userId))?.value ?? 0)
                    })))
            .sort((a, b) => b.value - a.value)
            .filter((b) => b.value !== 0);
        const rank = balances.findIndex((b) => b.value === balances.find((b) => b.userId === inter.user.id)?.value);
        const description = balances
            .map((b, i) => `**${balances.findIndex((v) => v.value === b.value) + 1}.** <@${b.userId}> - ${stat === 'activity' ? '✨' : '🪙'}${b.value}`)
            .join('\n') || 'There are currently no users in the leaderboard.';
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(`${stat.replace(/\b\w/g, (c) => c.toUpperCase())} Leaderboard`)
            .setDescription(description)
            .setColor(inter.client.color);
        if (rank !== -1)
            embed.setFooter({ text: `Your rank: ${toOrdnial(rank + 1)}` });
        const select = new discord_js_1.SelectMenuBuilder()
            .setCustomId('sortLeaderboard')
            .setPlaceholder('Sort the leaderboard')
            .addOptions(this.emojis.map((v, k) => new discord_js_1.SelectMenuOptionBuilder()
            .setLabel(k.replace(/\b\w/g, (c) => c.toUpperCase()))
            .setValue(k)
            .setEmoji(v)
            .setDefault(stat === k)));
        const row = new discord_js_1.ActionRowBuilder().setComponents(select);
        if (inter.isMessageComponent())
            await inter.update({ embeds: [embed], components: [row] });
        else
            await inter.reply({ embeds: [embed], components: [row] });
    }
}
exports.leaderboard = new Leaderboard();
class SortLeaderboard extends core_1.SelectMenu {
    constructor() {
        super(...arguments);
        this.name = 'sortLeaderboard';
    }
    async run(inter) {
        await exports.leaderboard.run(inter, inter.values[0]);
    }
}
exports.SortLeaderboard = SortLeaderboard;
