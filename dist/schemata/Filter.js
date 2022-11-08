"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.filter = new mongoose_1.default.Schema({
    channelId: {
        type: String,
        required: true
    },
    images: Boolean,
    videos: Boolean,
    audio: Boolean,
    match: String
});
exports.default = mongoose_1.default.model('Filter', exports.filter);
