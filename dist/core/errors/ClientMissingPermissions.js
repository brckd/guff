"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientMissingPermissions = void 0;
const discord_js_1 = require("discord.js");
const DiscordException_1 = require("./DiscordException");
class ClientMissingPermissions extends DiscordException_1.DiscordException {
    constructor(...permissions) {
        super(`I don't have the required permissions to do that${(0, discord_js_1.normalizeArray)(permissions).length > 0
            ? `:  ${(0, discord_js_1.normalizeArray)(permissions).map((p) => p ?? 'undefined')}`
            : ''}`);
        this.name = 'Client Missing Permissions';
    }
}
exports.ClientMissingPermissions = ClientMissingPermissions;
