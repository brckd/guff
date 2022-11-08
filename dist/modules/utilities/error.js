"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentError = exports.CommandError = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
class CommandError extends core_1.Listener {
    constructor(handler) {
        super();
        this.event = 'commandError';
        this.name = 'commandError';
        this.emitter = handler.client.commandHandler;
    }
    async run(inter, error) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(error.name)
            .setDescription(`❌ ${error.message}`)
            .setColor(discord_js_1.Colors.Red);
        const components = [];
        if (!(error instanceof core_1.DiscordException) &&
            inter.client.owners.includes(inter.user.id) &&
            error.stack) {
            embed.addFields({
                name: 'Stack',
                value: (0, discord_js_1.codeBlock)(error.stack.slice(0, 600))
            });
            console.log(error);
        }
        await inter.reply({
            embeds: [embed],
            components,
            ephemeral: true
        });
    }
}
exports.CommandError = CommandError;
class ComponentError extends core_1.Listener {
    constructor(handler) {
        super();
        this.event = 'componentError';
        this.name = 'componentError';
        this.emitter = handler.client.componentHandler;
    }
    async run(inter, error) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle(error.name)
            .setDescription(`❌ ${error.message}`)
            .setColor(discord_js_1.Colors.Red);
        const components = [];
        if (!(error instanceof core_1.DiscordException) &&
            inter.client.owners.includes(inter.user.id) &&
            error.stack) {
            embed.setFields({
                name: 'Stack',
                value: (0, discord_js_1.codeBlock)(error.stack.slice(0, 600))
            });
            console.log(error);
        }
        await inter.reply({
            embeds: [embed],
            components,
            ephemeral: true
        });
    }
}
exports.ComponentError = ComponentError;
