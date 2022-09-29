"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Ready = void 0;
const chalk_1 = __importDefault(require("chalk"));
const hmues_js_1 = require("hmues.js");
class Ready extends hmues_js_1.Listener {
    constructor(options) {
        super(Object.assign(Object.assign({}, options), { event: 'ready' }));
    }
    run(client) {
        var _a;
        console.log(`Logged in as ${chalk_1.default.hex(`#${(_a = client.color) === null || _a === void 0 ? void 0 : _a.toString(16)}`)(client.user.tag)}!`);
    }
}
exports.Ready = Ready;
