"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const ms_1 = __importDefault(require("ms"));
class UpdatePresence extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.event = 'ready';
        this.name = 'updatePresence';
        this.initActivity = {
            type: discord_js_1.ActivityType.Playing,
            name: 'restarting...'
        };
        this.activities = [
            (c) => ({
                type: discord_js_1.ActivityType.Watching,
                name: `${c.users.cache.size} users`
            }),
            (c) => ({
                type: discord_js_1.ActivityType.Watching,
                name: `${c.guilds.cache.size} guilds`
            }),
            (c) => ({
                type: discord_js_1.ActivityType.Playing,
                name: `for ${(0, ms_1.default)(c.uptime ?? NaN, { long: true })}`
            }),
            (c) => ({
                type: discord_js_1.ActivityType.Listening,
                name: `${(0, ms_1.default)(c.ws.ping)} heartbeat`
            }),
            {
                type: discord_js_1.ActivityType.Listening,
                name: '/Info'
            }
        ];
    }
    run(client) {
        client.user?.setPresence({
            activities: [this.initActivity]
        });
        setInterval(() => {
            const activity = this.activities[Math.floor(Math.random() * this.activities.length)];
            client.user?.setPresence({
                activities: [typeof activity === 'function' ? activity(client) : activity]
            });
        }, 10 * 1000);
    }
}
exports.default = UpdatePresence;
