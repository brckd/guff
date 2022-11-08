"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NsfwOnly = void 0;
const DiscordException_1 = require("./DiscordException");
class NsfwOnly extends DiscordException_1.DiscordException {
    constructor() {
        super('This command can only be run in a NSFW channel');
        this.name = 'NSFW Only';
    }
}
exports.NsfwOnly = NsfwOnly;
