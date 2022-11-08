"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Modal = exports.SelectMenu = exports.Button = exports.BaseComponent = void 0;
const discord_js_1 = require("discord.js");
const Module_1 = require("./Module");
class BaseComponent extends Module_1.Module {
    constructor() {
        super(...arguments);
        this.preconditions = [];
    }
}
exports.BaseComponent = BaseComponent;
class Button extends BaseComponent {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ComponentType.Button;
    }
}
exports.Button = Button;
class SelectMenu extends BaseComponent {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ComponentType.SelectMenu;
    }
}
exports.SelectMenu = SelectMenu;
class Modal extends BaseComponent {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ComponentType.TextInput;
    }
}
exports.Modal = Modal;
