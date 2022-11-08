"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wallet = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
exports.wallet = new mongoose_1.default.Schema({
    guildId: {
        type: String,
        required: true
    },
    userId: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        default: 0
    }
});
exports.default = mongoose_1.default.model('Wallet', exports.wallet);
