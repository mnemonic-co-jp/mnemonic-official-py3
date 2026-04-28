import { Injectable } from '@angular/core';
import { NgbDate, NgbDateStruct, NgbDatepickerI18n, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';

@Injectable()
export class CustomDatePickerI18n extends NgbDatepickerI18n {
  getWeekdayLabel(weekday: number): string {
    return ['月', '火', '水', '木', '金', '土', '日'][weekday - 1];
  }

  getMonthShortName(month: number): string {
    return ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'][month - 1];
  }

  getMonthFullName(month: number): string {
    return this.getMonthShortName(month);;
  }

  getDayAriaLabel(date: NgbDateStruct): string {
    return `${date.year}-${date.month}-${date.day}`;
  }
}

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
  parse(value: string): NgbDateStruct | null {
    if (!value) {
      return null;
    }
    const date = value.split('/');
    return new NgbDate(parseInt(date[0], 10), parseInt(date[1], 10), parseInt(date[2], 10));
  }

  format(date: NgbDateStruct | null): string {
    return date ? format(ngbDateStructToDate(date), 'yyyy/MM/dd') : '';
  }
}

export const padNumber = (num: number, digits: number = 2): string => {
  return `${'0'.repeat(digits - 1)}${num}`.slice(-digits);
};

export const createNgbDate = (dt: Date): NgbDate => {
  return new NgbDate(dt.getFullYear(), dt.getMonth() + 1, dt.getDate());
}

export const createNgbDateStruct = (dt: Date): NgbDateStruct => {
  return {
    year: dt.getFullYear(),
    month: dt.getMonth() + 1,
    day: dt.getDate(),
  };
}

export const ngbDateToDate = (date: NgbDate): Date => {
  return new Date(date.year, date.month - 1, date.day);
}

export const ngbDateStructToDate = (date: NgbDateStruct): Date => {
  return new Date(date.year, date.month - 1, date.day);
}
