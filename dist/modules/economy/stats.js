"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StatsButton = exports.stats = exports.Stats = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
const Bank_1 = __importDefault(require("../../schemata/Bank"));
const Xp_1 = __importDefault(require("../../schemata/Xp"));
const levels_1 = require("./levels");
const Inventory_1 = require("../../schemata/Inventory");
class Stats extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'stats';
        this.description = "Show someone's stats";
        this.options = [
            {
                name: 'target',
                description: 'Who you want to see the stats of',
                type: discord_js_1.ApplicationCommandOptionType.User
            },
            {
                name: 'stat',
                description: 'The stat to show',
                type: discord_js_1.ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: 'cash',
                        value: 'cash'
                    },
                    {
                        name: 'activity',
                        value: 'activity'
                    },
                    {
                        name: 'inv',
                        value: 'inv'
                    }
                ]
            }
        ];
    }
    async run(inter, target, type) {
        type ?? (type = 'cash');
        target ?? (target = inter.user);
        const embed = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: target.username,
            iconURL: target.avatarURL() ?? undefined
        })
            .setColor(inter.client.color);
        switch (type) {
            case 'activity': {
                const xp = (await Xp_1.default.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0;
                const xpDiff = (0, levels_1.toXp)((0, levels_1.toLvl)(xp) + 1) - (0, levels_1.toXp)((0, levels_1.toLvl)(xp));
                embed.addFields({
                    name: 'Xp',
                    value: `✨${xp}`,
                    inline: true
                }, {
                    name: 'Level',
                    value: `🏆${(0, levels_1.toLvl)(xp)}`,
                    inline: true
                }, {
                    name: 'Progress',
                    value: `\`${xpDiff - ((0, levels_1.toXp)((0, levels_1.toLvl)(xp) + 1) - xp)}/${xpDiff}xp for 🏆${(0, levels_1.toLvl)(xp) + 1}\``
                });
                break;
            }
            case 'cash': {
                const wallet = (await Wallet_1.default.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0;
                const bank = (await Bank_1.default.findOne({ guildId: inter.guildId, userId: target.id }))?.value ?? 0;
                embed.addFields({
                    name: 'Wallet',
                    value: `🪙${wallet}`,
                    inline: true
                }, {
                    name: 'Bank',
                    value: `🪙${bank}`,
                    inline: true
                }, {
                    name: 'Total',
                    value: `🪙${wallet + bank}`,
                    inline: true
                });
                break;
            }
            case 'inv': {
                const invs = await Inventory_1.Inv.find({ guildId: inter.guildId, userId: target.id }).populate('item');
                embed.setDescription(invs
                    .filter((i) => i.amount !== 0)
                    .map((i) => `${i.item.emoji} **${i.item.name}** - ${i.amount}\n${i.item.description}`)
                    .join('\n') || "This user doesn't own any items.");
            }
        }
        const buttons = [
            ['cash', '🪙'],
            ['activity', '📊'],
            ['inv', '💼']
        ].map(([id, e]) => new discord_js_1.ButtonBuilder()
            .setCustomId(`stats-${id}-${target.id}`)
            .setEmoji(e)
            .setDisabled(id === type)
            .setStyle(id === type ? discord_js_1.ButtonStyle.Primary : discord_js_1.ButtonStyle.Secondary));
        const row = new discord_js_1.ActionRowBuilder().setComponents(buttons);
        if (inter.isButton())
            await inter.update({
                embeds: [embed],
                components: [row]
            });
        else
            await inter.reply({
                embeds: [embed],
                components: [row]
            });
    }
}
exports.Stats = Stats;
exports.stats = new Stats();
class StatsButton extends core_1.Button {
    constructor() {
        super(...arguments);
        this.name = 'stats';
    }
    async run(inter, type, target) {
        await exports.stats.run(inter, await inter.client.users.fetch(target), type);
    }
}
exports.StatsButton = StatsButton;
