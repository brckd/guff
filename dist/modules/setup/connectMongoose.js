"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectMongoose = void 0;
const core_1 = require("../../core");
const mongoose_1 = __importDefault(require("mongoose"));
require("dotenv/config");
class ConnectMongoose extends core_1.Listener {
    constructor() {
        super(...arguments);
        this.event = 'ready';
        this.name = 'connectMongoose';
    }
    async run() {
        await mongoose_1.default.connect(process.env.MONGO_URI ?? '', { keepAlive: true });
    }
}
exports.ConnectMongoose = ConnectMongoose;
