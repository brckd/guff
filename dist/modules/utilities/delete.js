"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Delete = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
class Delete extends core_1.MessageContextMenuCommand {
    constructor() {
        super(...arguments);
        this.name = 'Delete';
    }
    async run(inter, message) {
        if (!message.deletable)
            throw new core_1.ClientMissingPermissions('ManageMessages');
        await (async () => {
            if (!inter.inGuild())
                return; // DM
            if (inter.user.id === message.author.id)
                return; // own message
            if (message.author.bot && inter.user.id === message.interaction?.user.id)
                return; // application command
            if (message.author.bot &&
                message.reference?.messageId &&
                inter.user.id ===
                    (await inter.channel?.messages.fetch(message.reference.messageId))?.author.id)
                return; // text command
            if (inter.memberPermissions?.has(discord_js_1.PermissionFlagsBits.ManageMessages))
                return; // has ManageMessages permission
            throw new core_1.MissingPermissions('ManageMessages');
        })();
        await message.delete();
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setDescription('✅ Message has successfully been deleted')
                    .setColor(discord_js_1.Colors.Green)
            ],
            ephemeral: true
        });
    }
}
exports.Delete = Delete;
