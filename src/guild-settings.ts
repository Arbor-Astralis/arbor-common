import * as fs from 'fs';
import * as path from 'path';
import * as botEnv from "./environment.js";

const GUILD_SETTINGS_DIRECTORY_NAME = "guilds";
const GUILD_SETTINGS_FILE = 'settings.json';

export interface IGuildData {
    settings: GuildSettings;
    settingsFile: string;
}

export class GuildSettings {
    private readonly _guildId: string;
    #data?: any;

    constructor(guildId: string, data: any = null) {
        if (new.target !== GuildSettings) {
            throw new Error("Inheriting GuildSettings is forbidden");
        }
        this._guildId = guildId;
        this.#data = data;
    }

    get guildId(): string {
        return this._guildId;
    }

    get data(): any {
        return this.#data;
    }

    get toString(): string {
        return JSON.stringify(this.data, null, 4);
    }

    set data(value: any) {
        const guildData: IGuildData = resolveGuildData(this._guildId);
        const serializedData: string = JSON.stringify(value, null, 4);

        fs.writeFileSync(guildData.settingsFile, serializedData, { encoding: 'utf8' });
        this.#data = value;
    }
}

export function getForGuild(guildId: string, initialData: any): GuildSettings {
    const guildData: IGuildData = resolveGuildData(guildId);

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

function resolveGuildData(guildId: string): IGuildData {
    const guildDir: string = path.resolve(resolveGuildSettingsDirectory(), guildId);

    if (!isDirectory(guildDir)) {
        fs.mkdirSync(guildDir);
    }

    const settings = new GuildSettings(guildId);
    const settingsFile: string = path.resolve(guildDir, GUILD_SETTINGS_FILE);

    return { settings: settings, settingsFile: settingsFile }
}

export function removeForGuild(guildId: string): void {
    const targetDir: string = path.resolve(resolveGuildSettingsDirectory(), guildId);

    if (isDirectory(targetDir)) {
        fs.rmdirSync(targetDir, { recursive: true });
    }
}

function resolveGuildSettingsDirectory(): string {
    const guildDir: string = path.resolve(botEnv.getDataDirectory(), GUILD_SETTINGS_DIRECTORY_NAME);
    if (!fs.existsSync(guildDir)) {
        fs.mkdirSync(guildDir);
    }
    return guildDir;
}

function isDirectory(path: string): boolean {
    try {
        return fs.statSync(path).isDirectory();
    } catch (err) {
        return false;
    }
}
