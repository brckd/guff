"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RolesMenu = exports.SetRoles = exports.Roles = void 0;
const core_1 = require("../../core");
const common_tags_1 = require("common-tags");
const discord_js_1 = require("discord.js");
const emojis = [
    [[0xe6, 0xe7, 0xe8], '⚪'],
    [[0x31, 0x37, 0x3d], '⚫'],
    [[0xdd, 0x2e, 0x44], '🔴'],
    [[0x55, 0xac, 0xee], '🔵'],
    [[0xc1, 0x69, 0x4f], '🟤'],
    [[0xaa, 0x8e, 0xd6], '🟣'],
    [[0x78, 0xb1, 0x59], '🟢'],
    [[0xfd, 0xcb, 0x58], '🟡'],
    [[0xf4, 0x90, 0x0c], '🟠']
];
function colorEmoji(color) {
    const c = [Math.floor(color / 65536), Math.floor(color / 256) % 256, color % 256];
    let min = Infinity;
    let emoji;
    for (const [c2, e] of emojis) {
        const dist = (c[0] - c2[0]) ** 2 + (c[1] - c2[1]) ** 2 + (c[2] - c2[2]) ** 2;
        if (min < dist)
            continue;
        min = dist;
        emoji = e;
    }
    return emoji;
}
class Roles extends core_1.MessageContextMenuCommand {
    constructor() {
        super();
        this.name = 'Roles';
        this.clientPermissions = ['ManageRoles', 'ManageMessages', 'ManageWebhooks'];
        this.defaultMemberPermissions = new discord_js_1.PermissionsBitField(['ManageRoles', 'ManageMessages']);
        this.preconditions = ['GuildOnly', 'ClientPermissions'];
    }
    async run(inter, message) {
        const roles = inter.guild?.roles.cache.filter((r) => r.position > 0 &&
            inter.member.roles.highest.position > r.position &&
            (inter.guild?.members.me?.roles.highest.position ?? 0) > r.position);
        if (!roles)
            throw new core_1.DiscordException('No roles to ');
        const row = new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId(`setroles-${message.id}`)
            .setPlaceholder('Set roles')
            .setOptions(roles.map((r) => new discord_js_1.SelectMenuOptionBuilder()
            .setLabel(r.name)
            .setValue(r.id)
            .setEmoji(colorEmoji(r.color))))
            .setMaxValues(roles.size));
        await inter.reply({
            components: [row],
            ephemeral: true
        });
    }
}
exports.Roles = Roles;
class SetRoles extends core_1.SelectMenu {
    constructor() {
        super(...arguments);
        this.name = 'setroles';
    }
    async run(inter, messageId) {
        const message = await inter.channel?.messages.fetch(messageId);
        if (!message)
            return;
        const row = new discord_js_1.ActionRowBuilder().setComponents(new discord_js_1.SelectMenuBuilder()
            .setCustomId('roles')
            .setPlaceholder('Toggle your roles')
            .addOptions(new discord_js_1.SelectMenuOptionBuilder()
            .setLabel('Remove All Roles')
            .setValue('remove')
            .setEmoji('🗑️'))
            .addOptions(await Promise.all(inter.values.map(async (v) => {
            const r = await inter.guild?.roles.fetch(v);
            return new discord_js_1.SelectMenuOptionBuilder()
                .setLabel(r?.name ?? '')
                .setValue(v)
                .setEmoji(colorEmoji(r?.color ?? 0));
        })))
            .setMinValues(0)
            .setMaxValues(inter.values.length + 1));
        const webhook = await inter.client.provideWebhook(inter.channel);
        await webhook.send({
            username: message.author.username,
            avatarURL: message.author.avatarURL() ?? undefined,
            content: message.content,
            embeds: message.embeds,
            components: [row]
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription((0, common_tags_1.stripIndents) `✅ Added roles: ${await Promise.all(inter.values.map((v) => `\n> ${inter.guild?.roles.cache.get(v)}`))}`)
            .setTitle('Roles')
            .setColor(discord_js_1.Colors.Green);
        await message.delete();
        await inter.update({
            embeds: [embed],
            components: []
        });
    }
}
exports.SetRoles = SetRoles;
class RolesMenu extends core_1.SelectMenu {
    constructor() {
        super(...arguments);
        this.name = 'roles';
    }
    async run(inter) {
        if (!(inter.member instanceof discord_js_1.GuildMember))
            return;
        const embed = new discord_js_1.EmbedBuilder().setTitle('Roles').setColor(inter.client.color);
        const values = inter.values.filter((v) => v !== 'remove');
        if (inter.values.includes('remove'))
            for (const o of inter.component.options)
                if (o.value !== 'remove')
                    await inter.member.roles.remove(o.value);
        if (!inter.member.roles.cache.hasAll(...values))
            embed.addFields({
                name: 'Added',
                value: (await Promise.all(values
                    .filter((v) => !inter.member.roles.cache.has(v))
                    .map(async (v) => `> <@&${v}>`))).join('\n')
            });
        if (inter.member.roles.cache.hasAny(...values))
            embed.addFields({
                name: 'Removed',
                value: inter.member.roles.cache
                    .filter((r) => values.includes(r.id))
                    .map((r) => `> ${r}`)
                    .join('\n')
            });
        for (const v of values)
            if (!inter.member.roles.cache.has(v))
                await inter.member.roles.add(v);
            else
                await inter.member.roles.remove(v);
        if (!embed.data.fields)
            await inter.update({});
        else
            await inter.reply({
                embeds: [embed],
                ephemeral: true
            });
    }
}
exports.RolesMenu = RolesMenu;
