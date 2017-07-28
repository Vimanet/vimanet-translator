import { AppSettings } from '../models/app-settings.model';
import * as ElectronConfig from 'electron-config';

export class AppSettingsService {

    constructor(private config: ElectronConfig) {
    }

    get(): AppSettings {
        var settings = new AppSettings();
        settings.autoLaunch = this.config.get('autoLaunch', false);
        settings.translateClipboardShortcut = this.config.get('translateClipboardShortcut', null);
        settings.translateApiKey = this.config.get('translateApiKey', null);
        settings.defaultSourceLanguageCode = this.config.get('defaultSourceLanguageCode', 'en');
        settings.defaultTargetLanguageCode = this.config.get('defaultTargetLanguageCode', 'pl');
        return settings;
    }

    set(settings: AppSettings) {
        this.config.set(settings);
    }
}