import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'formatDatetime'
})
export class FormatDateTimePipe implements PipeTransform {
  transform(value: Date | moment.Moment | string | number): string {
    if (!value) {
      return '';
    }

    return moment(value).format('YYYY-MM-DD, HH:mm');
  }
}