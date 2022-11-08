"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listener = void 0;
const Module_1 = require("./Module");
/** Represents a listener */
class Listener extends Module_1.Module {
    constructor(handler) {
        super();
        if (handler)
            this.emitter = handler.client;
    }
}
exports.Listener = Listener;
