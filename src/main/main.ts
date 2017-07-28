import { app, BrowserWindow, Tray, Menu, globalShortcut, clipboard, ipcMain } from 'electron';
import { enableLiveReload } from 'electron-compile';
import { Events } from '../common/events';
import { AppSettingsService } from '../common/services/app-settings.service';
import { Shared, SharedData, SharedSerices } from "../common/models/shared.model";
import * as isDev from 'electron-is-dev';
import * as logger from 'electron-log';
import * as devtron from 'devtron';
import * as ElectronConfig from 'electron-config';
import * as AutoLaunch from 'auto-launch';
import * as path from 'path';

export default class Main {
    static browserWindow: Electron.BrowserWindow;
    static app: Electron.App;
    static logger: any;
    static appSettingsService: AppSettingsService;
    static autoLaunch: AutoLaunch;
    static tray: any;
    static appIsQuiting: boolean;

    static main() {
        Main.app = app;
        Main.logger = logger;
        Main.appSettingsService = new AppSettingsService(new ElectronConfig());
        Main.autoLaunch = new AutoLaunch({ name: app.getName() });

        Main.configureLiveReload();
        Main.configureLogger();
        Main.createSharedObject();
        Main.bindEvents();
    }

    private static createSharedObject() {
        global['shared'] = new Shared();
        global['shared'].data = new SharedData({
            iconPath: path.join(__dirname, '../common/assets/icons/icon.png'),
            logPath: Main.logger.transports.file.file,
            homePageUrl: '',
            appName: Main.app.getName(),
            appVersion: Main.app.getVersion()
        });
        global['shared'].services = new SharedSerices({
            logger: Main.logger,
            appSettings: Main.appSettingsService
        });
    }

    private static configureLiveReload() {
        if (isDev) {
            enableLiveReload();
        }
    }

    private static configureLogger() {
        logger.transports.file.file = path.join(process.cwd(), 'log.txt');
        if (isDev) {
            logger.transports.file.level = 'debug';
            logger.transports.console.level = 'debug';
            logger.debug('DevMode is on');
        } else {
            logger.transports.console.level = false;
            logger.transports.file.level = 'error';
        }
    }

    private static bindEvents() {
        Main.app.on('activate', Main.appOnActivate);
        Main.app.on('window-all-closed', Main.appOnWindowAllClosed);
        Main.app.on('ready', Main.appOnReady);

        process.on('uncaughtException', Main.onProcessUncaughtException);
    }

    private static appOnActivate() {
        if (Main.browserWindow === null) {
            Main.appOnReady();
        }
    }

    private static appOnWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.app.quit();
            Main.logger.debug('Application close');
        }
    }

    private static appOnReady() {
        Main.logger.debug('Create main window start');

        //create the browser window.
        Main.browserWindow = new BrowserWindow({
            title: Main.app.getName(),
            width: 1024, height: 768,
            show: false,
            icon: global['shared'].data.iconPath
        });

        //load the index.html of the app.
        let pathToIndexHtml = path.join(__dirname, '../render/index.html');
        Main.browserWindow.loadURL(`file://${pathToIndexHtml}`);
        Main.logger.debug('Loading file: ' + pathToIndexHtml);

        if (isDev) {
            Main.browserWindow.webContents.openDevTools();
            devtron.install();
        }

        Main.logger.debug('AppSettings :: '+JSON.stringify(Main.appSettingsService.get()));

        //setup autolunch
        let autoLaunch = Main.appSettingsService.get().autoLaunch;
        if (autoLaunch == true)
            Main.autoLaunch.enable();
        else
            Main.autoLaunch.disable();

        //setup shortcut
        let translateClipboardShortcut = Main.appSettingsService.get().translateClipboardShortcut;
        if (translateClipboardShortcut) {
            Main.bindTranslateShortcut(translateClipboardShortcut);
        }

        //setup tray
        Main.tray = new Tray(global['shared'].data.iconPath);
        Main.tray.setToolTip(Main.app.getName());

        //setup context menu
        let contextMenu = Menu.buildFromTemplate(Main.getContextMenuItems());
        Main.tray.setContextMenu(contextMenu);

        Main.browserWindow.on('close', (event) => {
            if (!Main.appIsQuiting) {
                event.preventDefault()
                Main.browserWindow.hide();
            }
            return false;
        });

        // Emitted when the window is closed.
        Main.browserWindow.on('closed', () => {
            // Dereference the window object, usually you would store windows
            // in an array if your app supports multi windows, this is the time
            // when you should delete the corresponding element.
            Main.browserWindow = null;
        });

        Main.browserWindow.webContents.on('crashed', (event) => {
            Main.logger.error('mainWindow.crashed :: ' + JSON.stringify(event));
        });

        Main.browserWindow.on('unresponsive', (event: any) => {
            Main.logger.error('mainWindow.unresponsive :: ' + JSON.stringify(event));
        });

        ipcMain.on(Events.SETTINGS_TRANSLATE_CLIPBOARD_SHORTCUT_CHANGE, Main.onTranslateClipboardShortcutUpdate);
        ipcMain.on(Events.SETTINGS_AUTO_LUNCH_CHANGE, Main.onAutoLunchUpdate);

        Main.logger.debug('Create main window end');
    }

    private static onProcessUncaughtException(err: any) {
        Main.logger.error('process.uncaughtException :: ' + err.message);
        Main.logger.error(err.stack);
        process.exit(1);
    }

    private static onTranslateClipboardShortcutUpdate(event: any, args: any) {
        let translateClipboardShortcut = Main.appSettingsService.get().translateClipboardShortcut;
        if (translateClipboardShortcut)
            globalShortcut.unregister(translateClipboardShortcut);

        translateClipboardShortcut = args[0].translateClipboardShortcut;

        if (translateClipboardShortcut) {
            Main.bindTranslateShortcut(translateClipboardShortcut);
        }
    }

    private static onAutoLunchUpdate(event: any, args: any) {
        if (args[0].autoLaunch) {
            Main.autoLaunch.enable();
        } else {
            Main.autoLaunch.disable();
        }
    }

    private static bindTranslateShortcut(hotkey: string) {
        const ret = globalShortcut.register(hotkey, () => {
            var clipboardText = clipboard.readText() || clipboard.readRTF();
            Main.browserWindow.webContents.send(Events.TRANSLATE_CLIPBOARD_TEXT, { clipboardText: clipboardText });
            Main.browserWindow.show();
        })

        if (!ret) {
            Main.logger.error(`hotkey: ${hotkey} registration failed`);
        }
    }

    private static getContextMenuItems() {
        let result = [];

        result.push({
            label: 'Show',
            click: function () {
                Main.browserWindow.show();
            },
        });

        if (isDev) {
            result.push({
                label: 'Toggle DevTools',
                click: function () {
                    Main.browserWindow.show();
                    Main.browserWindow.toggleDevTools();
                }
            });
        }

        result.push({
            label: 'Quit',
            click: function () {
                Main.appIsQuiting = true;
                Main.app.quit();
            }
        });

        return result;
    }
}