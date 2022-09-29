"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Guff_1 = require("./Guff");
require("dotenv/config");
const discord_js_1 = require("discord.js");
const client = new Guff_1.Guff({
    intents: ['Guilds', 'GuildMessages', 'DirectMessages', 'MessageContent'],
    color: discord_js_1.Colors.Green
});
client.login(process.env.TOKEN);
