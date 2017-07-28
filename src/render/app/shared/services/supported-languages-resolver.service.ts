
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { remote } from 'electron';
import { Observable } from 'rxjs/Observable';
import { Language } from '../models/language.model';
import { ILoggerService } from '../../../../common/services/ilogger.service';
import { AppSettingsService } from '../../../../common/services/app-settings.service';
import { TranslatorService } from '../../translator/translator.service';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/of';
import * as _ from 'lodash';

@Injectable()
export class SupportedLanguagesResolver implements Resolve<Language[]> {
    private loggerService: ILoggerService;
    private appSettingsService: AppSettingsService;
    private getSupportedLanguagesResult: Language[];

    constructor(private translatorService: TranslatorService,
        private router: Router) {
        this.loggerService = remote.getGlobal('shared').services.logger;
        this.appSettingsService = remote.getGlobal('shared').services.appSettings;
    }

    resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Language[]> {
        if (!this.appSettingsService.get().isValid()) {
            let errorObj = {
                message: 'Please update settings with valid value(s), since only then you will be able to use translator.'
            };
            this.router.navigate(['/settings', errorObj]);
            return Observable.of([]);
        }

        if (this.getSupportedLanguagesResult && this.getSupportedLanguagesResult.length > 0) {
            return Observable.of(this.getSupportedLanguagesResult);
        }

        return this.translatorService.getSupportedLanguages()
            .map(langs => {
                if (langs) {
                    this.getSupportedLanguagesResult = _.orderBy(langs, ['value'], ['asc']);
                    return this.getSupportedLanguagesResult;
                }
                let errorObj = {
                    message: 'An error occured while resolving supported language list. List is empty. Please try again later.'
                };
                this.router.navigate(['/error', errorObj]);
                return null;
            })
            .catch(error => {
                let errorObj = {
                    message: 'An error occured while fetching supported language list. Please verify your internet connection and API key in the settings, then try again.'
                };

                if ((error && error.hasOwnProperty('message'))) {
                    errorObj.message = error.message;
                }

                this.router.navigate(['/error', errorObj]);
                this.loggerService.error('SupportedLanguagesResolver.resolve :: ' + JSON.stringify(errorObj));
                return Observable.of(null);
            });
    }
}