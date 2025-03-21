import * as fs from 'fs';
import * as path from 'path';
import * as utilities from './utilities.mjs';

let _botName;
let _botToken;
let _botDataDirectory;

const GLOBAL_SETTINGS_FILE = "bot-settings.json";

export function initialize(
    botName = utilities.required('botName'),
    initialGlobalSettings,
    dataDirectory
) {
    _botName = botName;
    _botDataDirectory = dataDirectory ?? path.resolve(process.cwd(), 'bot-data');

    console.log('aa-common: botName = ' + _botName);
    console.log('aa-common: botDataDirectory = ' + _botDataDirectory);

    if (!fs.existsSync(getDataDirectory())) {
        fs.mkdirSync(getDataDirectory());
    }

    const settingsFilePath = path.resolve(getDataDirectory(), GLOBAL_SETTINGS_FILE);

    if (initialGlobalSettings && !fs.existsSync(settingsFilePath)) {
        const serializedData = JSON.stringify(initialGlobalSettings);
        fs.writeFileSync(settingsFilePath, serializedData)
    }

    const tokenFilePath = path.resolve(getDataDirectory(), 'bot-token.txt');
    const emptyTokenString = 'input-token-here';

    if (!fs.existsSync(tokenFilePath)) {
        fs.writeFileSync(tokenFilePath, emptyTokenString);
        requireTokenSetup(tokenFilePath);
        return;
    }

    const readToken = fs.readFileSync(tokenFilePath, { encoding: 'utf8' }).replace(/\n/g, '').trim();

    if (readToken === emptyTokenString) {
        requireTokenSetup(tokenFilePath);
        return;
    }

    _botToken = readToken;

    let globalSettingsData = null;

    if (fs.existsSync(settingsFilePath)) {
        const settingsFileContent = fs.readFileSync(settingsFilePath, 'utf8')
        globalSettingsData = JSON.parse(settingsFileContent);
    }

    console.log('aa-common: initialized!');

    return globalSettingsData;
}

export function getName() {
    assertInitialized();
    return _botName;
}

export function getToken() {
    assertInitialized();
    return _botToken;
}

export function getDataDirectory() {
    assertInitialized();
    return _botDataDirectory;
}

function assertInitialized() {
    if (!_botDataDirectory) {
        throw new Error('Bot environment is not initialized!');
    }
}

function requireTokenSetup(tokenFilePath) {
    console.error(`aa-common: bot token must be configured at: ${tokenFilePath}`);
    process.exit(1);
}
