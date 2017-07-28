import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslatorComponent } from '../translator/translator.component';
import { HistoryComponent } from '../history/history.component';
import { SettingsComponent } from '../settings/settings.component';
import { ErrorComponent } from '../error/error.component';
import { AboutComponent } from '../about/about.component';
import { TranslatorService } from '../translator/translator.service';
import { SettingsGuard } from '../settings/settings-guard.service';
import { SupportedLanguagesResolver } from './services/supported-languages-resolver.service';

@NgModule({
    imports: [
        RouterModule.forRoot([
            { path: 'translator', component: TranslatorComponent, resolve: { supportedLanguages: SupportedLanguagesResolver } },
            { path: 'history', component: HistoryComponent, resolve: { supportedLanguages: SupportedLanguagesResolver } },
            { path: 'settings', component: SettingsComponent, canDeactivate: [SettingsGuard] },
            { path: 'about', component: AboutComponent },
            { path: '', redirectTo: '/translator', pathMatch: 'full' },
            { path: '**', component: ErrorComponent }
        ])
    ],
    exports: [
        RouterModule
    ],
    declarations: [],
    providers: [TranslatorService, SupportedLanguagesResolver, SettingsGuard],
})
export class AppRoutingModule { }
