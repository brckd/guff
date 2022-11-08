"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordException = void 0;
class DiscordException extends Error {
    constructor(arg1, arg2) {
        super(arg2 ?? arg1);
        this.name = 'Discord Exception';
        if (arg2)
            this.name = arg1;
    }
}
exports.DiscordException = DiscordException;
