"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GuildOnlyPrecondition = void 0;
const errors_1 = require("../errors");
const modules_1 = require("../modules");
class GuildOnlyPrecondition extends modules_1.Precondition {
    constructor() {
        super(...arguments);
        this.name = 'GuildOnly';
    }
    run(interaction) {
        if (!interaction.inGuild())
            throw new errors_1.GuildOnly();
    }
}
exports.GuildOnlyPrecondition = GuildOnlyPrecondition;
