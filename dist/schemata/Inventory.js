"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Inv = exports.inv = void 0;
const mongoose_1 = require("mongoose");
exports.inv = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    item: { type: mongoose_1.Schema.Types.ObjectId, ref: 'Item' },
    amount: { type: Number, default: 0 }
});
exports.Inv = (0, mongoose_1.model)('Inv', exports.inv);
