"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageContextMenuCommand = exports.UserContextMenuCommand = exports.ChatInputCommand = exports.BaseCommand = void 0;
const Module_1 = require("./Module");
const discord_js_1 = require("discord.js");
/** Represents a base command */
class BaseCommand extends Module_1.Module {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ApplicationCommandType.ChatInput;
        this.preconditions = [];
    }
}
exports.BaseCommand = BaseCommand;
class ChatInputCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ApplicationCommandType.ChatInput;
        this.options = [];
    }
}
exports.ChatInputCommand = ChatInputCommand;
class UserContextMenuCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ApplicationCommandType.User;
    }
}
exports.UserContextMenuCommand = UserContextMenuCommand;
class MessageContextMenuCommand extends BaseCommand {
    constructor() {
        super(...arguments);
        this.type = discord_js_1.ApplicationCommandType.Message;
    }
}
exports.MessageContextMenuCommand = MessageContextMenuCommand;
