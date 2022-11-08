"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.XP = exports.levelUp = exports.toXp = exports.toLvl = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Xp_1 = __importDefault(require("../../schemata/Xp"));
function toLvl(xp) {
    return Math.floor(xp ** 0.5);
}
exports.toLvl = toLvl;
function toXp(lvl) {
    return Math.floor(lvl) ** 2;
}
exports.toXp = toXp;
async function levelUp(inter, before, after) {
    if (toLvl(after) <= toLvl(before))
        return;
    const embed = new discord_js_1.EmbedBuilder()
        .setDescription(`${inter.author} has reached lvl 🏆**${toLvl(after)}**!`)
        .setFooter({
        text: `Collect ✨${toXp(toLvl(after) + 1) - after} more xp for lvl 🏆${toLvl(after) + 1}`
    })
        .setColor(inter.client.color);
    await inter.channel.send({
        embeds: [embed]
    });
}
exports.levelUp = levelUp;
class XP extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.name = 'xp';
        this.event = 'messageCreate';
    }
    async run(msg) {
        if (!msg.inGuild())
            return;
        if (msg.author.bot)
            return;
        const xp = await Xp_1.default.findOneAndUpdate({ guildId: msg.guildId, userId: msg.author.id }, {}, { upsert: true, new: true });
        await levelUp(msg, xp.value, ++xp.value);
        await xp.save();
    }
}
exports.XP = XP;
