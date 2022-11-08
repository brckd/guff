"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BucketScope = void 0;
/**
 * The scope the cooldown applies to.
 */
var BucketScope;
(function (BucketScope) {
    /**
     * Per channel cooldowns.
     */
    BucketScope[BucketScope["Channel"] = 0] = "Channel";
    /**
     * Global cooldowns.
     */
    BucketScope[BucketScope["Global"] = 1] = "Global";
    /**
     * Per guild cooldowns.
     */
    BucketScope[BucketScope["Guild"] = 2] = "Guild";
    /**
     * Per user cooldowns.
     */
    BucketScope[BucketScope["User"] = 3] = "User";
})(BucketScope = exports.BucketScope || (exports.BucketScope = {}));
