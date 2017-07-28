import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { IpcRendererService } from './shared/services/ipc-renderer.service';
import { Router, Event, NavigationStart, NavigationEnd, NavigationError, NavigationCancel } from '@angular/router';
import { TranslationHistoryDatabaseService } from './shared/services/translation-history-database.service';
import { Title } from '@angular/platform-browser';
import { remote } from 'electron';

@Component({
    selector: 'app-root',
    templateUrl: 'app/app.component.html',
    providers: [IpcRendererService, TranslationHistoryDatabaseService, Location]
})
export class AppComponent implements OnInit {
    loading: boolean = true;

    constructor(private ipcRendererService: IpcRendererService,
        private chRef: ChangeDetectorRef,
        private router: Router,
        private titleService: Title) { }

    ngOnInit() {
        this.bindEvents();
        this.titleService.setTitle(remote.getGlobal('shared').data.appName);
    }

    bindEvents() {
        this.router.events.subscribe((routerEvent: Event) => {
            this.checkRouterEvent(routerEvent);
        });

        this.ipcRendererService.on('TRANSLATE_CLIPBOARD_TEXT', (event: any, args: any) => {
            this.router.navigateByUrl('/translator?source=' + args.clipboardText);
        });
    }

    checkRouterEvent(routerEvent: Event): void {

        if (routerEvent instanceof NavigationStart) {
            this.loading = true;
        }

        if (routerEvent instanceof NavigationEnd ||
            routerEvent instanceof NavigationCancel ||
            routerEvent instanceof NavigationError) {
            this.loading = false;
            this.chRef.detectChanges();
        }
    }
}