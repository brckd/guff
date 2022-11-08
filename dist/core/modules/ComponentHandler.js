"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComponentHandler = void 0;
const Component_1 = require("./Component");
const ModuleHandler_1 = require("./ModuleHandler");
const PreconditionHandler_1 = require("./PreconditionHandler");
class ComponentHandler extends ModuleHandler_1.ModuleHandler {
    constructor(client, options) {
        super(client);
        this.holds = Component_1.BaseComponent;
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
                    this.emit('componentError', interaction, error);
                else
                    console.error(error);
            }
        });
    }
    async handle(interaction) {
        if (!interaction.isMessageComponent() && !interaction.isModalSubmit())
            return;
        const [customId, ...options] = interaction.customId.split('-');
        const module = this.modules.get(customId);
        if (!module)
            return;
        for (const precondition of module.preconditions)
            await this.preconditionHandler.modules.get(precondition)?.run(interaction, module);
        await this.modules.get(customId)?.run(interaction, ...options);
    }
}
exports.ComponentHandler = ComponentHandler;
