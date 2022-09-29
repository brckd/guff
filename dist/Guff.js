"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Guff = void 0;
const discord_js_1 = require("discord.js");
const hmues_js_1 = require("hmues.js");
const path_1 = require("path");
class Guff extends discord_js_1.Client {
    constructor(options) {
        var _a;
        super(options);
        this.listenerStore = new hmues_js_1.ListenerStore(this);
        this.listenerStore.load((0, path_1.join)(__dirname, 'listeners'));
        this.color = (_a = options.color) !== null && _a !== void 0 ? _a : null;
    }
}
exports.Guff = Guff;
