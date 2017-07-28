import { ILoggerService } from '../services/ilogger.service';
import { AppSettingsService } from '../services/app-settings.service';

export class Shared {
    data:SharedData;
    services:SharedSerices;
}

export class SharedData{
    iconPath:string;
    logPath:string;
    homePageUrl:string;
    appName:string;
    appVersion:string;

    public constructor(init?:Partial<SharedData>) {
        Object.assign(this, init);
    }    
}

export class SharedSerices{
    logger:ILoggerService;
    appSettings:AppSettingsService;

    public constructor(init?:Partial<SharedSerices>) {
        Object.assign(this, init);
    }       
}