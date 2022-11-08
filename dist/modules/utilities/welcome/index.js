"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoodBye = exports.Welcome = void 0;
const core_1 = require("../../../core");
const canvas_1 = require("canvas");
const discord_js_1 = require("discord.js");
const path_1 = require("path");
function createImage({ back, avatar, caption }) {
    const size = (back.width + back.height) / 2;
    const margin = size * 0.05;
    const av = {
        x: 0.5 * back.width,
        y: 0.4 * back.height,
        r: 0.35 * size * 0.5
    };
    const text = {
        content: caption,
        x: 0.5 * back.width,
        y: 0.8 * back.height,
        px: Math.round(size * 0.1),
        color: 'white'
    };
    const canvas = (0, canvas_1.createCanvas)(back.width, back.height);
    const ctx = canvas.getContext('2d');
    ctx.drawImage(back, 0, 0);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(margin, margin, back.width - 2 * margin, back.height - 2 * margin);
    ctx.save();
    ctx.beginPath();
    ctx.arc(av.x, av.y, av.r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, av.x - av.r, av.y - av.r, av.r * 2, av.r * 2);
    ctx.restore();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.font = `${text.px}px Roboto`;
    ctx.fillText(text.content, text.x, text.y);
    return canvas;
}
class Welcome extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.event = 'guildMemberAdd';
        this.name = 'welcome';
    }
    async run(member) {
        if (!member.guild.systemChannel)
            return;
        const back = await (0, canvas_1.loadImage)((0, path_1.resolve)((0, path_1.join)(__dirname, 'welcome.jpg')));
        const avatar = await (0, canvas_1.loadImage)(member.displayAvatarURL());
        const canvas = createImage({ back, avatar, caption: `Welcome ${member.displayName}` });
        const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer()).setName('image.png');
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(`Welcome ${member} to **${member.guild.name}**!`)
            .setColor(member.client.color)
            .setImage('attachment://image.png');
        const sent = await member.guild.systemChannel.send({
            embeds: [embed],
            files: [attachment]
        });
        await sent.react('👋');
    }
}
exports.Welcome = Welcome;
class GoodBye extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.event = 'guildMemberRemove';
        this.name = 'goodbye';
    }
    async run(member) {
        if (!member.guild.systemChannel)
            return;
        const back = await (0, canvas_1.loadImage)((0, path_1.resolve)((0, path_1.join)(__dirname, 'goodbye.jpg')));
        const avatar = await (0, canvas_1.loadImage)(member.displayAvatarURL());
        const canvas = createImage({ back, avatar, caption: `Goodbye, ${member.nickname}` });
        const attachment = new discord_js_1.AttachmentBuilder(canvas.toBuffer()).setName('image.png');
        const embed = new discord_js_1.EmbedBuilder()
            .setDescription(`Goodbye, ${member} 👋`)
            .setColor(member.client.color)
            .setImage('attachment://image.png');
        const sent = await member.guild.systemChannel.send({
            embeds: [embed],
            files: [attachment]
        });
        await sent.react('👋');
    }
}
exports.GoodBye = GoodBye;
