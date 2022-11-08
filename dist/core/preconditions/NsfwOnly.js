"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NsfwOnlyPrecondition = void 0;
const discord_js_1 = require("discord.js");
const errors_1 = require("../errors");
const modules_1 = require("../modules");
class NsfwOnlyPrecondition extends modules_1.Precondition {
    constructor() {
        super(...arguments);
        this.name = 'NsfwOnly';
    }
    run(interaction) {
        if (interaction.channel instanceof discord_js_1.BaseGuildTextChannel && interaction.channel.nsfw)
            throw new errors_1.NsfwOnly();
    }
}
exports.NsfwOnlyPrecondition = NsfwOnlyPrecondition;
