"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientPermissions = void 0;
const errors_1 = require("../errors");
const modules_1 = require("../modules");
class ClientPermissions extends modules_1.Precondition {
    constructor() {
        super(...arguments);
        this.name = 'ClientPermissions';
    }
    run(interaction, context) {
        const missing = interaction.appPermissions?.missing(context.clientPermissions);
        if (missing && missing.length > 0)
            throw new errors_1.ClientMissingPermissions(missing);
    }
}
exports.ClientPermissions = ClientPermissions;
