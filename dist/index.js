"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HydroClient = void 0;
const discord_js_1 = require("discord.js");
const core_1 = require("./core");
const path_1 = require("path");
class HydroClient extends discord_js_1.Client {
    constructor(options) {
        super(options);
        this.owners = options.owners ?? [];
        this.color = options.color ?? null;
        this.inviteURL = options.inviteURL ?? '';
        this.preconditionHandler = new core_1.PreconditionHandler(this);
        this.commandHandler = new core_1.CommandHandler(this, {
            preconditionHandler: this.preconditionHandler
        });
        void this.commandHandler.load((0, path_1.join)(__dirname, 'modules'));
        this.componentHandler = new core_1.ComponentHandler(this, {
            preconditionHandler: this.preconditionHandler
        });
        void this.componentHandler.load((0, path_1.join)(__dirname, 'modules'));
        this.listenerHandler = new core_1.ListenerHandler(this);
        void this.listenerHandler.load((0, path_1.join)(__dirname, 'modules'));
    }
    async provideWebhook(channel) {
        return ((await channel.fetchWebhooks())?.find((w) => w.applicationId === this.application?.id) ??
            (await channel.createWebhook({
                name: `${this.user?.username} Hook`,
                avatar: this.user?.avatarURL()
            })));
    }
}
exports.HydroClient = HydroClient;
