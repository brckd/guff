"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreconditionHandler = void 0;
const ModuleHandler_1 = require("./ModuleHandler");
const Precondition_1 = require("./Precondition");
const path_1 = require("path");
class PreconditionHandler extends ModuleHandler_1.ModuleHandler {
    constructor(client) {
        super(client);
        this.holds = Precondition_1.Precondition;
        void this.load((0, path_1.join)(__dirname, '../preconditions'));
    }
}
exports.PreconditionHandler = PreconditionHandler;
