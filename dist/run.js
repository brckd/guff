"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const _1 = require(".");
const discord_js_1 = require("discord.js");
require("dotenv/config");
const client = new _1.HydroClient({
    intents: [
        'Guilds',
        'DirectMessages',
        'GuildMembers',
        'GuildMessages',
        'DirectMessages',
        'MessageContent'
    ],
    partials: [discord_js_1.Partials.Channel, discord_js_1.Partials.Message],
    allowedMentions: { parse: ['roles', 'users'] },
    owners: ['691572882148425809'],
    color: discord_js_1.Colors.Purple,
    inviteURL: 'https://discord.com/api/oauth2/authorize?client_id=986707906999251014&permissions=76800&scope=bot%20applications.commands'
});
void client.login(process.env.TOKEN);
