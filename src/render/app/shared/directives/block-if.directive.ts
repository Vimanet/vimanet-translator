import { Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[block-if]'
})
export class BlockIfDirective {
    private _blockIf: boolean;

    @Input('block-if')
    set blockIf(value: boolean) {
        this._blockIf = value;
        this.onInputChange();
    }

    constructor(private elementRef: ElementRef)
    { }

    onInputChange(): void {
        this._blockIf ? this.block() : this.unblock();
    }

    block(): void {
        window.jQuery(this.elementRef.nativeElement).block(
            {
                message: '<i class="fa fa-gear fa-spin" style="font-size:40px;color:white"></i><br /><br /><strong>Loading</strong>',
                css: { border: '0px', background: 'none', color: 'white' }
            });
    }

    unblock(): void {
        window.jQuery(this.elementRef.nativeElement).unblock();
    }
}