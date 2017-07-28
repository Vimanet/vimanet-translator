import { Component, OnInit } from '@angular/core';
import { IpcRendererService } from '../shared/services/ipc-renderer.service';
import { Events } from '../../../common/events';
import { ToasterService } from 'angular2-toaster';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { remote } from 'electron';
import { AppSettingsService } from '../../../common/services/app-settings.service';
import { AppSettings } from '../../../common/models/app-settings.model';

@Component({
  templateUrl: 'app/settings/settings.component.html',
  styleUrls: ['app/settings/settings.component.css'],
})
export class SettingsComponent implements OnInit {
  appSettingsService: AppSettingsService;
  appSettings: AppSettings;
  routeSubscription: Subscription;

  get isDirty(): boolean {
    return JSON.stringify(this.appSettings) !== JSON.stringify(this.appSettingsService.get());
  }

  constructor(private ipcRendererService: IpcRendererService,
    private toasterService: ToasterService,
    private route: ActivatedRoute) {
    this.appSettingsService = remote.getGlobal('shared').services.appSettings;
  }

  ngOnInit() {
    this.appSettings = this.appSettingsService.get();
    this.routeSubscription = this.route.params.subscribe(params => {
      let message = params['message'] || '';
      if (message) {
        this.toasterService.pop('info', 'Info', message);
      }
    });
  }

  ngOnDestroy() {
    this.routeSubscription.unsubscribe();
  }

  getApiKey(): void {
    const shell = require('electron').shell;
    shell.openItem('https://tech.yandex.com/translate/');
  }

  save(isValid: boolean): void {
    if (!isValid) {
      this.toasterService.pop('error', 'Oops!', 'Form contains error(s). Correct invalid field(s) and try again.');
      return;
    }

    this.ipcRendererService.send(Events.SETTINGS_TRANSLATE_CLIPBOARD_SHORTCUT_CHANGE, { translateClipboardShortcut: this.appSettings.translateClipboardShortcut || null });
    this.ipcRendererService.send(Events.SETTINGS_AUTO_LUNCH_CHANGE, { autoLaunch: this.appSettings.autoLaunch || false });
    this.appSettingsService.set(this.appSettings);
    this.toasterService.pop('success', 'Success!', 'Settings have been saved.');
  }
}