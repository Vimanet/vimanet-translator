import { Component, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
//https://www.bootply.com/92189
const noop = () => {
};

export const CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => CustomSwitchComponent),
    multi: true
};

@Component({
    selector: 'custom-switch',
    template: `<div class="btn-group btn-toggle"> 
    <button class="btn btn-sm btn-default" 
            [class.active]="value!==false" 
            [class.btn-primary]="value!==false"
            (click)="toggle($event)">ON</button>
    <button class="btn btn-sm btn-default" 
            [class.active]="value===false" 
            [class.btn-primary]="value===false"
            (click)="toggle($event)">OFF</button>
    </div>`,
    providers: [CUSTOM_INPUT_CONTROL_VALUE_ACCESSOR]
})
export class CustomSwitchComponent implements ControlValueAccessor {

    //The internal data model
    private innerValue: Boolean = false;

    //Placeholders for the callbacks which are later providesd
    //by the Control Value Accessor
    private onTouchedCallback: () => void = noop;
    private onChangeCallback: (_: Boolean) => void = noop;

    //get accessor
    get value(): Boolean {
        return this.innerValue;
    };

    //set accessor including call the onchange callback
    set value(v: Boolean) {
        if (v !== this.innerValue) {
            this.innerValue = v;
            this.onChangeCallback(v);
        }
    }

    //Set touched on blur
    onBlur() {
        this.onTouchedCallback();
    }

    //From ControlValueAccessor interface
    writeValue(value: Boolean) {
        if (value !== this.innerValue) {
            this.innerValue = value;
        }
    }

    //From ControlValueAccessor interface
    registerOnChange(fn: any) {
        this.onChangeCallback = fn;
    }

    //From ControlValueAccessor interface
    registerOnTouched(fn: any) {
        this.onTouchedCallback = fn;
    }

    toggle(event: MouseEvent) {
        event.preventDefault();
        this.value = !this.innerValue;
    }
}