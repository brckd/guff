"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ready = void 0;
const core_1 = require("../../core");
const chalk_1 = __importDefault(require("chalk"));
class Ready extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.event = 'ready';
        this.name = 'ready';
    }
    run(client) {
        console.log(`Logged in as ${chalk_1.default.hex(`#${client.color?.toString(16).padStart(6, '#')}`)(client.user?.username)}!`);
    }
}
exports.Ready = Ready;
