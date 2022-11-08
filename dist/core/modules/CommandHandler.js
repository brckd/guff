"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandHandler = void 0;
const discord_js_1 = require("discord.js");
const ModuleHandler_1 = require("./ModuleHandler");
const Command_1 = require("./Command");
const PreconditionHandler_1 = require("./PreconditionHandler");
class CommandHandler extends ModuleHandler_1.ModuleHandler {
    constructor(client, options) {
        super(client);
        this.holds = Command_1.BaseCommand;
        this.preconditionHandler = options?.preconditionHandler ?? new PreconditionHandler_1.PreconditionHandler(client);
        this.setup();
    }
    setup() {
        this.client.on('interactionCreate', async (interaction) => {
            try {
                await this.handle(interaction);
            }
            catch (error) {
                if (error instanceof Error)
                    this.emit('commandError', interaction, error);
                else
                    console.error(error);
            }
        });
        this.client.once('ready', async (client) => {
            await client.application.commands.set(this.modules.map((m) => m));
        });
    }
    async handle(interaction) {
        if (!interaction.isCommand())
            return;
        const module = this.modules.get(interaction.commandName);
        if (!module)
            return;
        for (const precondition of module.preconditions)
            await this.preconditionHandler.modules.get(precondition)?.run(interaction, module);
        if (interaction.isChatInputCommand())
            await module.run(interaction, ...module.options.map((o) => {
                const option = interaction.options.get(o.name);
                switch (option?.type) {
                    case discord_js_1.ApplicationCommandOptionType.Attachment:
                        return option.attachment ?? null;
                    case discord_js_1.ApplicationCommandOptionType.Channel:
                        return option.channel ?? null;
                    case discord_js_1.ApplicationCommandOptionType.Mentionable:
                        return option?.member ?? option?.user ?? option?.role ?? null;
                    case discord_js_1.ApplicationCommandOptionType.Role:
                        return option.role ?? null;
                    case discord_js_1.ApplicationCommandOptionType.User:
                        return option.user ?? null;
                    default:
                        return option?.value ?? null;
                }
            }));
        else if (interaction.isUserContextMenuCommand())
            await module.run(interaction, interaction.targetUser);
        else if (interaction.isMessageContextMenuCommand())
            await module.run(interaction, interaction.targetMessage);
    }
    async register(module, filepath) {
        if (this.client.isReady())
            await this.client.application?.commands.create(module);
        await super.register(module, filepath);
    }
    async deregister(module) {
        const id = this.client.application?.commands.cache.find((c) => c.name === module.name)?.id;
        if (id)
            await this.client.application?.commands.delete(id);
        await super.deregister(module);
    }
}
exports.CommandHandler = CommandHandler;
