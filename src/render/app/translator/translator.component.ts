import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import { Translation } from '../shared/models/translation.model';
import { TranslatorService } from './translator.service';
import { TranslationHistoryDatabaseService } from '../shared/services/translation-history-database.service';
import { TranslationResult } from '../shared/models/translation-result.model';
import { Language } from '../shared/models/language.model';
import { ToasterService } from 'angular2-toaster';
import { remote } from 'electron';
import { AppSettingsService } from "../../../common/services/app-settings.service";
import { ILoggerService } from "../../../common/services/ilogger.service";
import { AppSettings } from "../../../common/models/app-settings.model";
import * as fs from 'fs';
import 'rxjs/add/operator/finally';

@Component({
  templateUrl: 'app/translator/translator.component.html',
  providers: [TranslatorService]
})
export class TranslatorComponent implements OnInit, OnDestroy {

  private appSettingsService: AppSettingsService;
  private loggerService: ILoggerService;
  private appSettings: AppSettings;

  model: Translation;
  languages: Language[];
  isBusy: boolean = false;
  queryParamsSubscription: Subscription;
  translateSubscription: Subscription;

  constructor(private cdRef: ChangeDetectorRef,
    private translatorService: TranslatorService,
    private activatedRoute: ActivatedRoute,
    private translationHistoryDatabaseService: TranslationHistoryDatabaseService,
    private toasterService: ToasterService) {
    this.loggerService = remote.getGlobal('shared').services.logger;
    this.appSettingsService = remote.getGlobal('shared').services.appSettings;
    this.model = new Translation();
  };

  ngOnInit() {
    this.languages = this.activatedRoute.snapshot.data.supportedLanguages;

    this.handleQueryParams();
    this.appSettings = this.appSettingsService.get();

    this.model.sourceLanguageCode = this.appSettings.defaultSourceLanguageCode;
    this.model.targetLanguageCode = this.appSettings.defaultTargetLanguageCode;
  }

  handleQueryParams(): void {
    this.queryParamsSubscription = this.activatedRoute.queryParams.subscribe((params: any) => {
      this.model.sourceText = params['source'] || "";

      if (this.model.sourceText) {
        this.submit();
      }
    });
  }

  canSubmit() {
    return (this.model.sourceLanguageCode
      && this.model.targetLanguageCode
      && this.model.sourceText
      && !this.isBusy);
  }

  submit(): void {
    this.isBusy = true;
    this.translateSubscription = this.translatorService.translate(this.model.sourceText, this.model.sourceLanguageCode, this.model.targetLanguageCode)
      .finally(() => this.isBusy = false)
      .subscribe((data: TranslationResult) => {
        this.model.targetText = data.text[0];
        this.model.createDate = new Date();
        this.translationHistoryDatabaseService.insert(this.model.toJSON());
        this.saveSelectedLanguagesToAppSettings();
        this.cdRef.detectChanges();
      }, (ex) => {
        this.toasterService.pop('error', 'Oops!', 'Translate action has completed with an error. Please verify your internet connection and API key in the settings, then try again.');
      })
  }

  saveSelectedLanguagesToAppSettings(): void {
    this.appSettings.defaultSourceLanguageCode = this.model.sourceLanguageCode;
    this.appSettings.defaultTargetLanguageCode = this.model.targetLanguageCode;
    this.appSettingsService.set(this.appSettings);
  }

  canBingOrGoogleTranslate(): boolean {
    return this.model && this.model.targetText && this.model.targetText.trim().length > 0;
  }

  bingTranslate(): void {
    this.openBrowserWindow(`https://www.bing.com/translator/?text=${this.model.sourceText}&from=${this.model.sourceLanguageCode}&to=${this.model.targetLanguageCode}`);
  }

  googleTranslate(): void {
    this.openBrowserWindow(`https://translate.google.com/?q=${this.model.sourceText}&sl=${this.model.sourceLanguageCode}&tl=${this.model.targetLanguageCode}`);
  }

  gotoYandexTranslate(): void {
    this.openBrowserWindow(`https://translate.yandex.com/`);
  }

  changeLanguages(): void {
    let modelCopy = JSON.parse(JSON.stringify(this.model));
    this.model.sourceLanguageCode = modelCopy.targetLanguageCode;
    this.model.targetLanguageCode = modelCopy.sourceLanguageCode;
  }

  readSourceFromFile(): void {
    let dialog = remote.dialog;
    let files = dialog.showOpenDialog({ filters: [{ name: 'text', extensions: ['txt'] }] });

    if (!files) { return; }

    let file = files[0];
    fs.readFile(file, "utf8", (err, data) => {
      if (err) {
        this.toasterService.pop('error', 'Oops!', 'An error occured while reading selected file.');
        this.loggerService.error('TranslatorComponent.readSourceFromFile :: ' + JSON.stringify(err));
        return;
      }
      this.model.sourceText = data;
      this.cdRef.detectChanges();
    });
  }

  private openBrowserWindow(url: string): void {
    const BrowserWindow = remote.BrowserWindow;
    let win = new BrowserWindow({
      width: 800, height: 600,
      webPreferences: { nodeIntegration: false },
      icon: remote.getGlobal('shared').settings.iconPath
    });
    win.loadURL(url);
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }

    if (this.translateSubscription) {
      this.translateSubscription.unsubscribe();
    }
  }
}