"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Monthly = exports.Weekly = exports.Daily = exports.Work = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const ms_1 = __importDefault(require("ms"));
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
class Earn extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.preconditions = ['Cooldown'];
    }
    async run(inter) {
        const profit = this.profit;
        const balance = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: inter.user.id }, {}, { upsert: true, new: true });
        balance.value += profit;
        await balance.save();
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setDescription(this.reply.replace('{profit}', profit.toString()))
                    .setFooter({ text: `You now have 🪙${balance.value} in your wallet` })
                    .setColor(inter.client.color)
            ]
        });
    }
}
class Work extends Earn {
    constructor() {
        super(...arguments);
        this.name = 'work';
        this.description = 'Work to earn some money';
        this.cooldown = {
            delay: (0, ms_1.default)('1h')
        };
        this.minProfit = 4;
        this.maxProfit = 7;
        this.reply = 'You worked and earned 🪙{profit}!';
    }
    get profit() {
        return Math.round(this.minProfit + Math.random() * (this.maxProfit - this.minProfit));
    }
}
exports.Work = Work;
class Daily extends Earn {
    constructor() {
        super(...arguments);
        this.name = 'daily';
        this.description = 'Get your daily reward';
        this.cooldown = {
            delay: (0, ms_1.default)('1d')
        };
        this.profit = 5;
        this.reply = 'You collected your daily 🪙{profit}!';
    }
}
exports.Daily = Daily;
class Weekly extends Daily {
    constructor() {
        super(...arguments);
        this.name = 'weekly';
        this.description = 'Get your weekly reward';
        this.cooldown = {
            delay: (0, ms_1.default)('1w')
        };
        this.profit = 10;
        this.reply = 'You collected your weekly 🪙{profit}!';
    }
}
exports.Weekly = Weekly;
class Monthly extends Daily {
    constructor() {
        super(...arguments);
        this.name = 'monthly';
        this.description = 'Get your monthly reward';
        this.cooldown = {
            delay: (0, ms_1.default)('30d')
        };
        this.profit = 15;
        this.reply = 'You collected your monthly 🪙{profit}!';
    }
}
exports.Monthly = Monthly;
