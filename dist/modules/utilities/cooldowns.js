"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooldowns = void 0;
const discord_js_1 = require("discord.js");
const core_1 = require("../../core");
class Cooldowns extends core_1.ChatInputCommand {
    constructor() {
        super(...arguments);
        this.name = 'cooldowns';
        this.description = 'List cooldowns for all commands';
    }
    async run(inter) {
        const cooldown = inter.client.preconditionHandler.modules.get('Cooldown');
        if (!cooldown)
            return;
        const commands = inter.client.commandHandler.modules.filter((c) => c.cooldown);
        const cooldowns = commands
            .map((c) => ({
            name: c.name,
            id: inter.client.application.commands.cache.find((x) => x.name === c.name)?.id ?? 0,
            end: (cooldown.buckets.get(c)?.get(cooldown.getBucketId(inter, c.cooldown.scope)) ?? 0) +
                c.cooldown.delay
        }))
            .sort((a, b) => a.end - b.end);
        const now = Date.now();
        const split = cooldowns.findIndex((c) => c.end > now);
        const ready = split >= 0 ? cooldowns.slice(0, split) : cooldowns;
        const pending = split >= 0 ? cooldowns.slice(split) : [];
        const embed = new discord_js_1.EmbedBuilder().setColor(inter.client.color);
        if (ready.length > 0)
            embed.addFields({
                name: '✅ Ready',
                value: ready.map((c) => `</${c.name}:${c.id}>`).join(' ')
            });
        if (pending.length > 0)
            embed.addFields({
                name: '⏰ Pending',
                value: pending
                    .map((c) => `</${c.name}:${c.id}> - <t:${Math.round(c.end / 1000)}:R>`)
                    .join('\n')
            });
        if (cooldowns.length === 0)
            embed.setDescription('There are currently no commands with a cooldown.');
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.Cooldowns = Cooldowns;
