import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { SettingsComponent } from './settings.component';

@Injectable()
export class SettingsGuard implements CanDeactivate<SettingsComponent>{

    canDeactivate(component: SettingsComponent) {
        if (component.isDirty) {
            return confirm('WARNING: You have some unsaved changes. Are you sure you want to leave before saving them?');
        }
        return true;
    }
}