import { Injectable } from '@angular/core';
import { ipcRenderer } from 'electron';

@Injectable()
export class IpcRendererService {
	constructor() { }

	on(message: string, callback) {
		return ipcRenderer.on(message, callback);
	}

	send(message: string, ...args) {
		ipcRenderer.send(message, args);
	}

	sendSync(message: string, ...args) {
		return ipcRenderer.sendSync(message, arguments);
	}
}