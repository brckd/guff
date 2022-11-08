"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleHandler = void 0;
const discord_js_1 = require("discord.js");
const events_1 = require("events");
const Module_1 = require("./Module");
const path_1 = require("path");
const promises_1 = require("fs/promises");
/** Base class for a module handler */
class ModuleHandler extends events_1.EventEmitter {
    /**
     * @param client The client
     */
    constructor(client) {
        super();
        /** Module constructor */
        this.holds = Module_1.Module;
        this.client = client;
        this.modules = new discord_js_1.Collection();
    }
    /**
     * Default filter to load files
     * @param filepath
     * @returns Whether the file should be loaded
     */
    filter(filepath) {
        return /.+(\.js|\.json|(?<!\.d)\.ts)/.test(filepath);
    }
    /**
     * Register a module
     * @param module The module
     * @param filepath The module's filepath
     */
    register(module, filepath) {
        module.filepath = module.filepath ?? filepath;
        this.modules.set(module.name, module);
        this.emit('register', module);
    }
    /**
     * Load all modules
     * @param directory Module directory
     * @param filter Filter to load files
     */
    async load(directory, filter = this.filter) {
        directory = (0, path_1.resolve)(directory);
        for (const filepath of await this.constructor.readdirRecursive(directory)) {
            if (!filter.call(this, filepath))
                continue;
            const modules = await Promise.resolve().then(() => __importStar(require(filepath)));
            for (const module in modules) {
                if (modules[module] instanceof this.holds)
                    await this.register(modules[module], directory);
                else if (modules[module].prototype instanceof this.holds)
                    await this.register(new modules[module](this), directory);
            }
        }
    }
    /**
     * Deregister a module
     * @param module The module
     */
    deregister(module) {
        this.modules.delete(module.name);
        this.emit('deregister', module);
    }
    /**
     * Deregister a module
     * @param name Unique name of the module
     */
    remove(name) {
        const module = this.modules.get(name);
        if (module)
            void this.deregister(module);
    }
    /**
     * Reads files recursively from a directory
     * @param directory Path of the file or directory
     */
    static async readdirRecursive(directory) {
        const result = [];
        await (async function read(directory) {
            if ((await (0, promises_1.stat)(directory)).isDirectory()) {
                for (const dir of await (0, promises_1.readdir)(directory))
                    await read((0, path_1.join)(directory, dir));
            }
            else {
                result.push(directory);
            }
        })(directory);
        return result;
    }
}
exports.ModuleHandler = ModuleHandler;
