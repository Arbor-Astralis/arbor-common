import * as fs from 'fs';
import * as path from 'path';
import * as botEnv from "./environment.mjs";
import {required} from "./utilities.mjs";

const GUILD_SETTINGS_DIRECTORY_NAME = "guilds";
const GUILD_SETTINGS_FILE = 'settings.json';

export class GuildSettings {
    #guildId;
    #data;

    constructor(guildId = required('guildId'), data) {
        if (new.target !== GuildSettings) {
            throw new Error("Inheriting GuildSettings is forbidden");
        }
        this.#guildId = guildId;
        this.#data = data;
    }

    get guildId() {
        return this.#guildId;
    }

    get data() {
        return this.#data;
    }

    get toString() {
        return JSON.stringify(this.data, null, 4);
    }

    set data(value) {
        const guildData = resolveGuildData(this.#guildId);
        const serializedData = JSON.stringify(value, null, 4);

        fs.writeFileSync(guildData.settingsFile, serializedData, { encoding: 'utf8' });
        this.#data = value;
    }
}

export function getForGuild(guildId = required('guildId'), initialData) {
    const guildData = resolveGuildData(guildId);

    if (fs.existsSync(guildData.settingsFile)) {
        try {
            guildData.settings.data = JSON.parse(fs.readFileSync(guildData.settingsFile, 'utf8'));
            return guildData.settings;
        } catch {
            console.error(`Failed to parse guild settings file: ${guildData.settingsFile}`);
        }
    } else if (initialData) {
        guildData.settings.data = initialData;
        fs.writeFileSync(guildData.settingsFile, JSON.stringify(initialData, null, 4));

        return resolveGuildData(guildId).settings;
    }

    return guildData.settings;
}

function resolveGuildData(guildId = required('guildId')) {
    const guildDir = path.resolve(resolveGuildSettingsDirectory(), guildId);

    if (!isDirectory(guildDir)) {
        fs.mkdirSync(guildDir);
    }

    const settings = new GuildSettings(guildId);
    const settingsFile = path.resolve(guildDir, GUILD_SETTINGS_FILE);

    return { settings: settings, settingsFile: settingsFile }
}

export function removeForGuild(guildId = required('guildId')) {
    const targetDir = path.resolve(resolveGuildSettingsDirectory(), guildId);

    if (isDirectory(targetDir)) {
        fs.rmdirSync(targetDir, { recursive: true });
    }
}

function resolveGuildSettingsDirectory() {
    const guildDir = path.resolve(botEnv.getDataDirectory(), GUILD_SETTINGS_DIRECTORY_NAME);
    if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir);
    }
    return guildDir;
}

function isDirectory(path) {
    try {
        return fs.statSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}
