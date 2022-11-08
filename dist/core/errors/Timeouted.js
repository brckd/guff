"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timeouted = void 0;
const DiscordException_1 = require("./DiscordException");
class Timeouted extends DiscordException_1.DiscordException {
    constructor(until) {
        super('You have been timeouted' + (until ? `. Try again <t:${Math.floor(until)}:R>` : ''));
        this.name = 'Timeouted';
    }
}
exports.Timeouted = Timeouted;
