"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guff = void 0;
const discord_js_1 = require("discord.js");
class Guff extends discord_js_1.Client {
    constructor(options) {
        var _a;
        super(options);
        this.color = (_a = options.color) !== null && _a !== void 0 ? _a : null;
    }
}
exports.Guff = Guff;
