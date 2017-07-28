export class AppSettings {
  autoLaunch:boolean;
  translateClipboardShortcut:string;
  translateApiKey:string;
  defaultSourceLanguageCode:string;
  defaultTargetLanguageCode:string;

  isValid(){
    return (this.translateApiKey && this.translateApiKey.trim() !== '');
  }
}