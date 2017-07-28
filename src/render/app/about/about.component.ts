import { Component, OnInit } from '@angular/core';
import { shell, remote } from 'electron';
import * as fs from 'fs';

@Component({
  templateUrl: 'app/about/about.component.html'
})
export class AboutComponent implements OnInit {

  public appName: string;
  public appVersion: string;

  private get GlobalData(): any {
    return remote.getGlobal('shared').data;
  }

  constructor() {
  }

  ngOnInit() {
    this.appName = this.GlobalData.appName;
    this.appVersion = this.GlobalData.appVersion;
  }

  canShowLogs(): boolean {
    return this.GlobalData.logPath
      && this.GlobalData.logPath.trim().length > 0
      && fs.existsSync(this.GlobalData.logPath);
  }

  showLogs(): void {
    shell.openItem(this.GlobalData.logPath);
  }

  canOpenHomePage(): boolean {
    return this.GlobalData.homePageUrl && this.GlobalData.homePageUrl.trim().length > 0;
  }

  openHomePage(): void {
    shell.openExternal(this.GlobalData.homePageUrl);
  }
}