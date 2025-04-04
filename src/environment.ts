import * as fs from 'fs';
import * as path from 'path';

let _botName: string;
let _botToken: string;
let _botDataDirectory: string;

const GLOBAL_SETTINGS_FILE = "bot-settings.json";

export type GlobalSettingDataString = string;

export function initialize(
    botName: string,
    initialGlobalSettings: GlobalSettingDataString,
    dataDirectory: string
): GlobalSettingDataString | null {
    _botName = botName;
    _botDataDirectory = dataDirectory ?? path.resolve(process.cwd(), 'bot-data');

    console.log('aa-common: botName = ' + _botName);
    console.log('aa-common: botDataDirectory = ' + _botDataDirectory);

    if (!fs.existsSync(getDataDirectory())) {
        fs.mkdirSync(getDataDirectory());
    }

    const settingsFilePath: string = path.resolve(getDataDirectory(), GLOBAL_SETTINGS_FILE);

    if (initialGlobalSettings && !fs.existsSync(settingsFilePath)) {
        const serializedData: string = JSON.stringify(initialGlobalSettings);
        fs.writeFileSync(settingsFilePath, serializedData)
    }

    const tokenFilePath: string = path.resolve(getDataDirectory(), 'bot-token.txt');
    const emptyTokenString = 'input-token-here';

    if (!fs.existsSync(tokenFilePath)) {
        fs.writeFileSync(tokenFilePath, emptyTokenString);
        requireTokenSetup(tokenFilePath);
        return null;
    }

    const readToken: string = fs.readFileSync(tokenFilePath, { encoding: 'utf8' }).replace(/\n/g, '').trim();

    if (readToken === emptyTokenString) {
        requireTokenSetup(tokenFilePath);
        return null;
    }

    _botToken = readToken;

    let globalSettingsData: GlobalSettingDataString | null = null;

    if (fs.existsSync(settingsFilePath)) {
        const settingsFileContent = fs.readFileSync(settingsFilePath, 'utf8')
        globalSettingsData = JSON.parse(settingsFileContent);
    }

    console.log('aa-common: initialized!');

    return globalSettingsData;
}

export function getName(): string {
    assertInitialized();
    return _botName;
}

export function getToken(): string {
    assertInitialized();
    return _botToken;
}

export function getDataDirectory(): string {
    assertInitialized();
    return _botDataDirectory;
}

function assertInitialized(): void {
    if (!_botDataDirectory) {
        throw new Error('Bot environment is not initialized!');
    }
}

function requireTokenSetup(tokenFilePath: string): void {
    console.error(`aa-common: bot token must be configured at: ${tokenFilePath}`);
    process.exit(1);
}
