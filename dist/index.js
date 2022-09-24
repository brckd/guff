"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Guff_1 = require("./Guff");
require("dotenv/config");
const chalk_1 = __importDefault(require("chalk"));
const discord_js_1 = require("discord.js");
const client = new Guff_1.Guff({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
    color: discord_js_1.Colors.Green
});
client.login(process.env.TOKEN);
client.on('ready', (c) => { var _a; return console.log(`Logged in as ${chalk_1.default.hex(`#${(_a = client.color) === null || _a === void 0 ? void 0 : _a.toString(16)}`)(c.user.tag)}`); });
