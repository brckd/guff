"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Cooldown = void 0;
const enums_1 = require("../types/enums");
const errors_1 = require("../errors");
const modules_1 = require("../modules");
class Cooldown extends modules_1.Precondition {
    constructor() {
        super(...arguments);
        this.name = 'Cooldown';
        this.buckets = new WeakMap();
    }
    run(interaction, context) {
        if (!this.buckets.has(context))
            this.buckets.set(context, new Map());
        const bucketId = this.getBucketId(interaction, context.cooldown.scope);
        const now = Date.now();
        const start = this.buckets.get(context)?.get(bucketId);
        if (start && now - start < context.cooldown.delay)
            throw new errors_1.Timeouted((start + context.cooldown.delay) / 1000);
        else
            this.buckets.get(context)?.set(bucketId, now);
    }
    getBucketId(interaction, scope) {
        switch (scope) {
            case enums_1.BucketScope.Global:
                return 'global';
            case enums_1.BucketScope.Channel:
                return interaction.channelId ?? interaction.user.id;
            case enums_1.BucketScope.Guild:
                return interaction.guildId ?? interaction.channelId ?? interaction.user.id;
            default:
                return interaction.user.id;
        }
    }
}
exports.Cooldown = Cooldown;
