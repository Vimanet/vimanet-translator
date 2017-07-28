import { FormatDateTimePipe } from '../pipes/format-datetime.pipe';
import { Language } from './language.model';
import * as _ from 'lodash';

export class Translation {
    //For POST requests, the maximum size of the text being passed is 10,000 characters.
    readonly sourceTextMaxLength = 10000;

    public _id: any;
    public sourceLanguageCode: string;

    private _sourceText: string;

    public get sourceText(): string {
        return this._sourceText;
    }

    public set sourceText(value: string) {
        this._sourceText = (value || "").substring(0, this.sourceTextMaxLength);
    }

    public targetLanguageCode: string;
    public targetText: string;
    public createDate: Date;

    //http://choly.ca/post/typescript-json/
    toJSON(): Object {
        let result = Object.assign({}, this, {
            sourceText: this._sourceText
        });
        delete result._sourceText;
        return result;
    }
}

export class TranslationViewModel extends Translation {

    constructor(t: Translation, langs: Language[]) {
        super();
        this._id = t._id;

        let sourceLanguage = _.find(langs, (l: Language) => { return l.key == t.sourceLanguageCode });
        this.sourceLanguageCode = t.sourceLanguageCode;
        this.sourceLanguageName = sourceLanguage ? sourceLanguage.value : t.sourceLanguageCode;

        this.sourceText = t.sourceText;

        let targetLanguage = _.find(langs, (l: Language) => { return l.key == t.targetLanguageCode });
        this.targetLanguageCode = t.targetLanguageCode;
        this.targetLanguageName = targetLanguage ? targetLanguage.value : t.targetLanguageCode;

        this.targetText = t.targetText;
        this.createDate = t.createDate;
        this.createDatetimeString = new FormatDateTimePipe().transform(t.createDate);
    }

    public sourceLanguageName: string;
    public targetLanguageName: string;
    public createDatetimeString: string;
    public deleteButton: string = '<button type="button" class="btn btn-icon pull-right" tooltip=\"Delete\" container=\"body\"><span class="glyphicon glyphicon-trash"></span></button>';
}