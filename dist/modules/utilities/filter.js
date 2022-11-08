"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilterMessages = exports.MediaFilters = exports.filterCommand = void 0;
const core_1 = require("../../core");
const discord_js_1 = require("discord.js");
const Filter_1 = __importDefault(require("../../schemata/Filter"));
class FilterCommand extends core_1.ChatInputCommand {
    constructor() {
        super();
        this.name = 'filter';
        this.description = 'Filter messages in this channel';
        this.media = [
            { id: 'images', emoji: '🖼️' },
            { id: 'videos', emoji: '🎞️' },
            { id: 'audio', emoji: '🔊' }
        ];
        this.clientPermissions = ['ManageMessages'];
        this.defaultMemberPermissions = ['ManageChannels'];
        this.preconditions = ['GuildOnly', 'ClientPermissions'];
    }
    async run(inter) {
        const filter = await Filter_1.default.findOneAndUpdate({ channelId: inter.channelId }, {}, { upsert: true, new: true });
        const mediaFilter = new discord_js_1.SelectMenuBuilder()
            .setCustomId(`mediaFilters-${filter.id}`)
            .setPlaceholder('Media Filters')
            .setMinValues(0)
            .setMaxValues(this.media.length)
            .setOptions(this.media.map((m) => new discord_js_1.SelectMenuOptionBuilder()
            .setLabel(m.id.replace(/\b\w/g, (c) => c.toUpperCase()))
            .setValue(m.id)
            .setEmoji(m.emoji)
            .setDefault(filter[m.id] ?? false)));
        const media = new discord_js_1.ActionRowBuilder().setComponents(mediaFilter);
        if (inter.isMessageComponent())
            await inter.update({
                components: [media]
            });
        else
            await inter.reply({
                components: [media],
                ephemeral: true
            });
    }
}
exports.filterCommand = new FilterCommand();
class MediaFilters extends core_1.SelectMenu {
    constructor() {
        super(...arguments);
        this.name = 'mediaFilters';
    }
    async run(inter, id) {
        const filter = await Filter_1.default.findById(id);
        if (!filter)
            return;
        for (const m of exports.filterCommand.media)
            filter[m.id] = inter.values.includes(m.id);
        await filter.save();
        await exports.filterCommand.run(inter);
    }
}
exports.MediaFilters = MediaFilters;
class FilterMessages extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.name = 'filterMessages';
        this.event = 'messageCreate';
    }
    async run(msg) {
        if (!msg.deletable)
            return;
        if (!(await Filter_1.default.exists({ channelId: msg.channelId })))
            return;
        await this.checkMedia(msg);
    }
    async checkMedia(msg) {
        const filter = await Filter_1.default.findOne({ channelId: msg.channelId });
        if (!filter)
            return;
        if (!filter.images && !filter.videos && !filter.audio)
            return;
        if (filter.images)
            if (msg.attachments.some((a) => a.contentType?.startsWith('image')) ||
                msg.embeds.some((e) => e.image ?? e.thumbnail))
                return;
        if (filter.videos)
            if (msg.attachments.some((a) => a.contentType?.startsWith('video')) ||
                msg.embeds.some((e) => e.video))
                return;
        if (filter.audio)
            if (msg.attachments.some((a) => a.contentType?.startsWith('audio')))
                return;
        await msg.delete();
    }
}
exports.FilterMessages = FilterMessages;
