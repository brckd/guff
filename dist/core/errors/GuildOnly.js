"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildOnly = void 0;
const DiscordException_1 = require("./DiscordException");
class GuildOnly extends DiscordException_1.DiscordException {
    constructor() {
        super('This command can only be run in a guild');
        this.name = 'Guild Only';
    }
}
exports.GuildOnly = GuildOnly;
