"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserInfo = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const common_tags_1 = require("common-tags");
const ms_1 = __importDefault(require("ms"));
class UserInfo extends core_1.UserContextMenuCommand {
    constructor() {
        super(...arguments);
        this.name = 'User Info';
    }
    async run(inter, user) {
        let sent;
        if (user.id === inter.client.user?.id)
            sent = await inter.reply({
                content: '*Pinging...*',
                fetchReply: true,
                ephemeral: true
            });
        await user.fetch(true);
        const embed = new discord_js_1.EmbedBuilder()
            .addFields({
            name: 'General',
            value: (0, common_tags_1.stripIndents) `
        > **Tag** - ${user.tag}
        > **ID** - \`${user.id}\`
        > **Created** - <t:${Math.floor(user.createdTimestamp / 1000)}:R>
        ${inter.targetMember instanceof discord_js_1.GuildMember && inter.targetMember.joinedTimestamp
                ? `> **Joined** - <t:${Math.floor(inter.targetMember.joinedTimestamp / 1000)}:R>\n`
                : ''}\
        ${user.hexAccentColor
                ? `> **[Banner](${user.bannerURL()}) Color** - \`${user.hexAccentColor}\`\n`
                : ''}\
        > **[Avatar](${user.avatarURL()})**`
        })
            .setThumbnail(user.avatarURL())
            .setTitle(this.name)
            .setColor(inter.client.color);
        if (inter.targetMember instanceof discord_js_1.GuildMember && inter.targetMember.roles.cache.size > 0)
            embed.addFields({
                name: `Roles (${inter.targetMember.roles.cache.size - 1})`,
                value: inter.targetMember.roles.cache
                    .filter((r) => r.position > 0)
                    .map((r) => `> ${r.toString()}`)
                    .join('\n')
            });
        if (user.id === inter.client.user?.id)
            embed.addFields({
                name: 'Cached',
                value: (0, common_tags_1.stripIndents) `
          > **Servers** - ${inter.client.guilds.cache.size}
          > **Channels** - ${inter.client.channels.cache.size}
          > **Users** - ${inter.client.users.cache.size}`
            }, {
                name: 'Responsiveness',
                value: (0, common_tags_1.stripIndents) `
          > **Started** - <t:${Math.floor((Date.now() - inter.client.uptime) / 1000)}:R>
          > **Websocket heartbeat** - ${(0, ms_1.default)(inter.client.ws.ping)}
          > **Roundtrip latency** - ${(0, ms_1.default)(sent.createdTimestamp - inter.createdTimestamp)}`
            });
        if (user.id !== inter.client.user?.id)
            await inter.reply({
                embeds: [embed],
                ephemeral: true
            });
        else
            await inter.editReply({
                content: null,
                embeds: [embed],
                components: [
                    new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.ButtonBuilder()
                        .setLabel('Invite')
                        .setURL(inter.client.inviteURL)
                        .setStyle(discord_js_1.ButtonStyle.Link))
                ]
            });
    }
}
exports.UserInfo = UserInfo;
