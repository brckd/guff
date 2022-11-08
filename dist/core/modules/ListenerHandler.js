"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListenerHandler = void 0;
const ModuleHandler_1 = require("./ModuleHandler");
const Listener_1 = require("./Listener");
/** Loads and handles events */
class ListenerHandler extends ModuleHandler_1.ModuleHandler {
    constructor() {
        super(...arguments);
        this.holds = Listener_1.Listener;
    }
    async register(module, filepath) {
        if (this.modules.has(module.name))
            await this.remove(module.name);
        await super.register(module, filepath);
        module.run = module.run.bind(module);
        if (module.once)
            module.emitter.once(module.event, module.run);
        else
            module.emitter.on(module.event, module.run);
    }
    deregister(module) {
        module.emitter.removeListener(module.event, module.run);
        void super.deregister(module);
    }
}
exports.ListenerHandler = ListenerHandler;
