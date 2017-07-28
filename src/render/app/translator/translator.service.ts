import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Language } from '../shared/models/language.model';
import { TranslationResult } from '../shared/models/translation-result.model';
import { remote } from 'electron';
import { ILoggerService } from '../../../common/services/ilogger.service';
import { AppSettingsService } from '../../../common/services/app-settings.service';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/observable/throw';

@Injectable()
export class TranslatorService {

    private get ApiKey(): string {
        if (this.appSettingsService) {
            return this.appSettingsService.get().translateApiKey;
        } else {
            return '';
        }
    }

    private readonly yandexBaseUrl = 'https://translate.yandex.net/api/v1.5/tr.json/';
    private loggerService: ILoggerService;
    private appSettingsService: AppSettingsService;

    constructor(private http: Http) {
        this.loggerService = remote.getGlobal('shared').services.logger;
        this.appSettingsService = remote.getGlobal('shared').services.appSettings;
    }

    translate(text: string, languageFrom: string = 'en', languageTo: string = 'pl'): Observable<TranslationResult> {
        if (!this.ApiKey) {
            return Observable.throw({ message: 'Translate action cannot be executed since API key is not specified. Set Api key in the settings form and try again.' });
        }

        let language = `${languageFrom}-${languageTo}`;
        let url = this.yandexBaseUrl + 'translate?key=' + this.ApiKey + '&lang=' + language;
        let data = 'text=' + text;
        let headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
        let options = new RequestOptions({ headers: headers });

        this.loggerService.debug('TranslatorService.translate :: http.post :: url :: ' + url);
        this.loggerService.debug('TranslatorService.translate :: http.post :: data :: ' + data);
        this.loggerService.debug('TranslatorService.translate :: http.post :: options :: ' + JSON.stringify(options));

        return this.http.post(url, data, options)
            .do((response) => {
                this.loggerService.debug('TranslatorService.translate :: http response :: ' + JSON.stringify(response))
            })
            .map((response) => {
                return response.json();
            })
            .catch(this.handleError);
    }

    getSupportedLanguages(uiLanguage: string = 'en'): Observable<Language[]> {
        if (!this.ApiKey) {
            return Observable.throw({ message: 'Supported language list cannot be fetched since API key is not specified. Set Api key in the settings form and try again.' });
        }

        let url = this.yandexBaseUrl + 'getLangs?ui=' + uiLanguage + '&key=' + this.ApiKey;
        this.loggerService.debug('TranslatorService.getSupportedLanguages :: http.get :: url :: ' + url);

        return this.http.get(url)
            .do((response) => {
                this.loggerService.debug('TranslatorService.getSupportedLanguages :: http response :: ' + JSON.stringify(response))
            })
            .map((response) => {
                return Object.keys(response.json().langs)
                    .map((k) => {
                        return new Language(k, response.json().langs[k]);
                    });
            })
            .catch((e) => this.handleError(e));
    }

    private handleError(error: Response): Observable<any> {
        this.loggerService.error('TranslatorService :: ' + JSON.stringify(error));
        return Observable.throw(error || 'Server error');
    }
}            