import { Injectable } from '@angular/core';
import { DatabaseService } from './database.service';

@Injectable()
export class TranslationHistoryDatabaseService extends DatabaseService {

    constructor() {
        super('translation-history.db');
    }
}