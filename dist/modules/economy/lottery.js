"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Start = exports.Submission = exports.Submit = exports.LotteryCommand = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Lottery_1 = __importDefault(require("../../schemata/Lottery"));
const Wallet_1 = __importDefault(require("../../schemata/Wallet"));
class LotteryCommand extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'lottery';
        this.description = 'Start a new Lottery';
        this.defaultMemberPermissions = ['Administrator'];
    }
    async run(inter) {
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('New Lottery')
            .setDescription('A new lottery has started!\nMake sure to submit your guess using the button ` 🎫 ` below')
            .setColor(inter.client.color);
        const submit = new discord_js_1.ButtonBuilder()
            .setCustomId(`lotterySubmit-${inter.id}`)
            .setEmoji('🎫')
            .setStyle(discord_js_1.ButtonStyle.Primary);
        const startLottery = new discord_js_1.ButtonBuilder()
            .setCustomId(`startLottery-${inter.id}`)
            .setEmoji('📯')
            .setStyle(discord_js_1.ButtonStyle.Secondary);
        const row = new discord_js_1.ActionRowBuilder().setComponents(submit, startLottery);
        await inter.reply({
            content: '<@&1002177367537635339>',
            embeds: [embed],
            components: [row]
        });
    }
}
exports.LotteryCommand = LotteryCommand;
class Submit extends core_1.Button {
    constructor() {
        super(...arguments);
        this.name = 'lotterySubmit';
    }
    async run(inter, id) {
        const submission = new discord_js_1.TextInputBuilder()
            .setCustomId('submission')
            .setLabel('Submission')
            .setPlaceholder('Submit 3 unique numbers from 1 to 9')
            .setStyle(discord_js_1.TextInputStyle.Short)
            .setMinLength(3)
            .setMaxLength(3);
        const row = new discord_js_1.ActionRowBuilder().setComponents(submission);
        const modal = new discord_js_1.ModalBuilder()
            .setCustomId(`lotterySubmission-${id}`)
            .setTitle('Submit')
            .setComponents(row);
        await inter.showModal(modal);
    }
}
exports.Submit = Submit;
class Submission extends core_1.Modal {
    constructor() {
        super(...arguments);
        this.name = 'lotterySubmission';
    }
    async run(inter, lotteryId) {
        const submission = inter.fields.getTextInputValue('submission').split('').sort().join('');
        if (!submission.match(/^[1-9]{3}$/))
            throw new core_1.DiscordException('Please provide 3 **valid** numbers from 1 to 9!');
        if (new Set(submission).size < submission.length)
            throw new core_1.DiscordException('Please provide 3 **unique** numbers from 1 to 9!');
        if (await Lottery_1.default.exists({
            value: submission,
            userId: { $not: { $eq: inter.user.id } }
        }))
            throw new core_1.DiscordException(`🎫**${submission}** has already been submitted by someone else`);
        await Lottery_1.default.findOneAndUpdate({ lotteryId, userId: inter.user.id }, { value: submission }, { upsert: true });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Your Submission')
            .setDescription(`You've submitted 🎫**${submission}**! You can also use the button \` 🎫 \` to change your submission.`)
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
        if (!inter.message?.embeds)
            throw new Error("Couldn't find lottery announcement message");
        const e = discord_js_1.EmbedBuilder.from(inter.message.embeds[0]);
        const submissions = (await Lottery_1.default.find({ lotteryId })).map((s) => `<@${s.userId}> - 🎫**${s.value}**`);
        e.setFields({ name: 'Submissions', value: submissions.join('\n') });
        e.setFooter({ text: `Total submissions: ${submissions.length}` });
        await inter.message?.edit({ embeds: [e] });
    }
}
exports.Submission = Submission;
class Start extends core_1.Button {
    constructor() {
        super(...arguments);
        this.name = 'startLottery';
        this.prize = 1000;
    }
    async run(inter, lotteryId) {
        if (!inter.memberPermissions?.has('Administrator'))
            throw new core_1.MissingPermissions('Administrator');
        const choices = Array.from({ length: 9 }, (v, k) => `${k + 1}`);
        const samples = [];
        for (let i = 0; i < 3; i++)
            samples.push(choices.splice(Math.random() * choices.length, 1)[0]);
        const value = samples.sort().join('');
        const match = await Lottery_1.default.findOne({ lotteryId, value });
        if (match) {
            const wallet = await Wallet_1.default.findOneAndUpdate({ guildId: inter.guildId, userId: match?.userId }, {}, { upsert: true, new: true });
            wallet.value += this.prize;
            await wallet.save();
        }
        const description = match
            ? `<@${match.userId}> has won and won 🪙${this.prize}`
            : 'Noone has won. Good luck next time!';
        const result = Array.from({ length: 9 }, (v, k) => `${value.includes(`${k + 1}`)
            ? '<a:happythonks:1010218907245744281>'
            : '<:sadthonk:1021511006024896542>'}${(k + 1) % 3 === 0 ? '\n' : ''}`).join('');
        const embed = discord_js_1.EmbedBuilder.from(inter.message.embeds[0])
            .setTitle('Lottery is Over')
            .setDescription(description)
            .spliceFields(0, 0, { name: `Result (${value.split('').join(', ')})`, value: result })
            .setColor(discord_js_1.Colors.Green);
        await inter.update({
            embeds: [embed],
            components: []
        });
        await Lottery_1.default.deleteMany({ lotteryId });
    }
}
exports.Start = Start;
