import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslationHistoryDatabaseService } from '../shared/services/translation-history-database.service';
import { Translation, TranslationViewModel } from '../shared/models/translation.model';
import { ToasterService } from 'angular2-toaster';
import { remote } from 'electron';
import * as json2csv from 'json2csv';
import * as fs from 'fs';
import * as _ from 'lodash';

@Component({
  templateUrl: 'app/history/history.component.html',
  styleUrls: ['app/history/history.component.css']
})
export class HistoryComponent implements OnInit {

  public rows: Array<any> = [];
  public columns: Array<any> = [
    {
      title: 'From',
      name: 'sourceLanguageName'
    },
    {
      title: 'To',
      name: 'targetLanguageName'
    },
    {
      title: 'Source',
      name: 'sourceText'
    },
    {
      title: 'Result',
      name: 'targetText'
    },
    {
      title: 'Created at',
      name: 'createDatetimeString',
      sort: 'desc',
      sortValueFunc: (x) => { return new Date(x).getTime(); }
    },
    {
      title: '',
      name: 'deleteButton',
      sort: false
    }
  ];

  public page: number = 1;
  public itemsPerPage: number = 10;
  public maxSize: number = 5;
  public numPages: number = 1;
  public length: number = 0;

  public config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
    className: ['table-striped', 'table-bordered']
  };

  public paginationInfo: any = {
    from: 0,
    to: 0,
    of: 0
  };

  public data: TranslationViewModel[];

  constructor(private translationHistoryDatabaseService: TranslationHistoryDatabaseService,
    private toasterService: ToasterService,
    private activatedRoute: ActivatedRoute,
    private cdRef: ChangeDetectorRef) {
    this.data = [];
  }

  public ngOnInit(): void {
    let languages = this.activatedRoute.snapshot.data.supportedLanguages;
    this.translationHistoryDatabaseService.findAll().then((items: Translation[]) => {
      this.data = items.map(x => { return new TranslationViewModel(x, languages); });
      this.onChangeTable(this.config);
    });
  }

  public changePage(page: any, data: Array<any> = this.data): Array<any> {
    let start = (page.page - 1) * page.itemsPerPage;
    let end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) {
      return data;
    }

    let columns = this.config.sorting.columns || [];
    let columnName: string = void 0;
    let sort: string = void 0;
    let sortValueFunc = (x) => { return x; };

    for (let i = 0; i < columns.length; i++) {
      if (columns[i].sort !== '' && columns[i].sort !== false) {
        columnName = columns[i].name;
        sort = columns[i].sort;
        sortValueFunc = columns[i].hasOwnProperty('sortValueFunc') ? columns[i].sortValueFunc : sortValueFunc;
      }
    }

    if (!columnName) {
      return data;
    }

    // simple sorting
    return data.sort((previous: any, current: any) => {
      if (sortValueFunc(previous[columnName]) > sortValueFunc(current[columnName])) {
        return sort === 'desc' ? -1 : 1;
      } else if (sortValueFunc(previous[columnName]) < sortValueFunc(current[columnName])) {
        return sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changeFilter(data: any, config: any): any {
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => {
          return item[column.name].match(column.filtering.filterString);
        });
      }
    });

    if (!config.filtering) {
      return filteredData;
    }

    if (config.filtering.columnName) {
      return filteredData.filter((item: any) =>
        item[config.filtering.columnName].match(this.config.filtering.filterString));
    }

    let tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        if (item[column.name].toString().match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) {
        tempArray.push(item);
      }
    });
    filteredData = tempArray;

    return filteredData;
  }

  public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
    if (config.filtering) {
      Object.assign(this.config.filtering, config.filtering);
    }

    if (config.sorting) {
      Object.assign(this.config.sorting, config.sorting);
    }

    let filteredData = this.changeFilter(this.data, this.config);
    let sortedData = this.changeSort(filteredData, this.config);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;

    if (config.paging) {
      this.paginationInfo.from = (sortedData.length) > 0 ? ((page.page * this.itemsPerPage) - this.itemsPerPage + 1) : 0;
      this.paginationInfo.to = (page.page * this.itemsPerPage > sortedData.length) ? sortedData.length : (page.page * this.itemsPerPage);
      this.paginationInfo.of = sortedData.length;
    }

    this.cdRef.detectChanges();
  }

  public onCellClick(data: any): any {
    if (data && data.column === "deleteButton") {
      this.deleteEntry(data.row)
    }
  }

  canDeleteAll() {
    return this.data && this.data.length > 0;
  }

  deleteAll() {
    if (confirm('Are you sure you want to delete entire history?')) {
      this.translationHistoryDatabaseService.removeAll().then(() => {
        this.data = [];
        this.onChangeTable(this.config);
        this.toasterService.pop('success', 'Success!', 'History has been removed.');
      })
    }
  }

  canExportToCsv() {
    return this.data && this.data.length > 0;
  }

  exportToCsv() {
    let dialog = remote.dialog;
    dialog.showSaveDialog({ filters: [{ name: 'csv', extensions: ['csv'] }] }, (filename) => {
      if (filename) {
        let dataToExport = this.data.map(x => {
          return {
            langFrom: x.sourceLanguageName,
            langTo: x.targetLanguageName,
            source: x.sourceText,
            target: x.targetText
          };
        });

        let csvData = json2csv({ data: dataToExport });

        fs.writeFile(filename, csvData, (err: any) => {
          if (err) throw err;
          this.toasterService.pop('success', 'Success!', 'History has been export to: ' + filename);
        });
      }
    });
  }

  deleteEntry(entry: TranslationViewModel) {
    if (confirm('Are you sure to delete this element?')) {
      var entryId = entry._id;
      this.translationHistoryDatabaseService.remove(entryId).then(() => {
        let removeFunc = (item: TranslationViewModel) => {
          return item._id == entryId;
        };

        _.remove(this.data, removeFunc);
        this.onChangeTable(this.config);
        this.toasterService.pop('success', 'Success!', 'Element has been removed.');
      })
    }
  }
}