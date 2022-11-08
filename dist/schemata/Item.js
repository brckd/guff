"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = exports.item = void 0;
const mongoose_1 = require("mongoose");
exports.item = new mongoose_1.Schema({
    guildId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        default: ''
    },
    emoji: {
        type: String,
        default: '📦'
    }
});
exports.Item = (0, mongoose_1.model)('Item', exports.item);
