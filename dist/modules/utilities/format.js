"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplyModal = exports.Reply = exports.Format = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
class Format extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'format';
        this.description = 'Format your text';
        this.options = [
            {
                type: discord_js_1.ApplicationCommandOptionType.String,
                name: 'text',
                description: 'The text to format',
                required: true
            }
        ];
        this.clientPermissions = ['ManageWebhooks'];
        this.preconditions = ['ClientPermissions', 'GuildOnly'];
    }
    async run(inter, text) {
        const domainChars = 'a-zA-Z0-9@%._\\\\+~#?&=';
        const urlChars = domainChars + ':/';
        const url = `[${domainChars}]{2,256}\\.[${domainChars}]{2,6}/?[${urlChars}]*`;
        const hyperLink = ['\\[.*\\]\\(', '\\)'];
        text = text.replace(new RegExp(`(?<![${urlChars}]|${hyperLink[0]})${url}`, 'g'), (s) => `[${s}](https://${s})`); // create hyperlinks
        text = text.replace(new RegExp(`(?<=${hyperLink[0]})${url}(?=${hyperLink[1]})`, 'g'), (s) => `https://${s}`); // complete existing hyperlinks
        const webhook = await inter.client.provideWebhook(inter.channel);
        await webhook.send({
            content: text,
            username: inter.member instanceof discord_js_1.GuildMember ? inter.member.displayName : inter.user.username,
            avatarURL: inter.member instanceof discord_js_1.GuildMember
                ? inter.member.displayAvatarURL()
                : inter.user.avatarURL() ?? undefined
        });
        await inter.reply({
            embeds: [
                new discord_js_1.EmbedBuilder()
                    .setTitle(this.name.replace(/\b\w/g, (c) => c.toUpperCase()))
                    .setDescription('Message has been formatted!')
                    .setColor(inter.client.color)
            ],
            ephemeral: true
        });
    }
}
exports.Format = Format;
class Reply extends core_1.MessageContextMenuCommand {
    constructor() {
        super();
        this.name = 'Reply';
        this.clientPermissions = ['ManageWebhooks'];
        this.preconditions = ['ClientPermissions', 'GuildOnly'];
    }
    async run(inter, message) {
        const content = new discord_js_1.TextInputBuilder()
            .setCustomId('content')
            .setLabel(`Replying to ${message.author.username}`)
            .setPlaceholder(`Message #${message.channel.name}`)
            .setMinLength(1)
            .setStyle(discord_js_1.TextInputStyle.Paragraph);
        const modal = new discord_js_1.ModalBuilder()
            .setTitle(this.name)
            .setCustomId(`reply-${message.id}`)
            .setComponents(new discord_js_1.ActionRowBuilder().setComponents(content));
        await inter.showModal(modal);
    }
}
exports.Reply = Reply;
class ReplyModal extends core_1.Modal {
    constructor() {
        super(...arguments);
        this.name = 'reply';
    }
    async run(inter, messageId) {
        const message = await inter.channel?.messages.fetch(messageId);
        if (message == null)
            throw new Error('Message not found!');
        const webhook = await inter.client.provideWebhook(inter.channel);
        const reference = new discord_js_1.EmbedBuilder()
            .setAuthor({
            name: message.author.username,
            url: message.url,
            iconURL: message.author.displayAvatarURL()
        })
            .setDescription(message.content ||
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            message.embeds[0].description ||
            message.embeds[0].fields[0].value ||
            '*embedded content*')
            .setColor('#4f545c');
        await webhook.send({
            content: inter.fields.getTextInputValue('content'),
            embeds: [reference],
            username: inter.member instanceof discord_js_1.GuildMember ? inter.member.displayName : inter.user.username,
            avatarURL: inter.member instanceof discord_js_1.GuildMember
                ? inter.member.displayAvatarURL()
                : inter.user.avatarURL() ?? undefined
        });
        const embed = new discord_js_1.EmbedBuilder()
            .setTitle('Reply')
            .setDescription('✅ Reply has been sent')
            .setColor(discord_js_1.Colors.Green);
        await inter.reply({
            embeds: [embed],
            ephemeral: true
        });
    }
}
exports.ReplyModal = ReplyModal;
