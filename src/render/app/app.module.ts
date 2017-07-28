import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { AppRoutingModule } from './shared/app.routing';
import { FormatDateTimePipe } from './shared/pipes/format-datetime.pipe';
import { AppComponent } from './app.component';
import { HistoryComponent } from './history/history.component';
import { TranslatorComponent } from './translator/translator.component';
import { SettingsComponent } from './settings/settings.component';
import { AboutComponent } from './about/about.component';
import { ErrorComponent } from './error/error.component';
import { CustomSwitchComponent } from './shared/components/custom-switch.component';
import { BlockIfDirective } from './shared/directives/block-if.directive';
import { InputTrimDirective } from './shared/directives/input-trim.directive';
import { ToasterModule } from 'angular2-toaster';
import { Ng2TableModule } from 'ng2-table/ng2-table';
import { PaginationModule, TooltipModule } from 'ng2-bootstrap';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule,
    ToasterModule,
    Ng2TableModule,
    PaginationModule.forRoot(),
    TooltipModule.forRoot()
  ],
  declarations: [
    AppComponent,
    HistoryComponent,
    TranslatorComponent,
    SettingsComponent,
    AboutComponent,
    ErrorComponent,
    FormatDateTimePipe,
    CustomSwitchComponent,
    BlockIfDirective,
    InputTrimDirective
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }