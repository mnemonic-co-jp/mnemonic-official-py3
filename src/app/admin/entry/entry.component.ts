import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { form, FormField, required, email, validateTree, RootFieldContext } from '@angular/forms/signals';
import { NgbDatepickerI18n, NgbDatepickerModule, NgbDate, NgbDateStruct, NgbDateParserFormatter } from '@ng-bootstrap/ng-bootstrap/datepicker';
import { NgSelectComponent } from '@ng-select/ng-select';
import { format } from 'date-fns';
import { CustomDatePickerI18n, CustomDateParserFormatter, createNgbDate, ngbDateToDate, ngbDateStructToDate } from '../../shared/services/datepicker.service';
import { EntriesService } from '../../shared/services/entries.service';
import { TagsService } from '../../shared/services/tags.service';
import { Entry, EntryPayload } from '../../shared/models/entry.model';
import { Tag } from '../../shared/models/tag.model';
import { ToastService } from '../../shared/services/toast.service';

interface EntryAlt {
  id?: number;
  title: string;
  date: NgbDate | null;
  tweetIds: string;
  body: string;
  tags: string[];
  isPublished: string;  // select では文字列扱いされてしまうので...
}

@Component({
  imports: [
    CommonModule,
    FormField,
    NgbDatepickerModule,
    NgSelectComponent
  ],
  providers: [
    { provide: NgbDatepickerI18n, useClass: CustomDatePickerI18n },
    { provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }
  ],
  templateUrl: './entry.component.html',
  styleUrl: './entry.component.scss',
})
export class AdminEntryComponent {
  private route = inject(ActivatedRoute);
  private entryId: number | null = null;
  private entriesService = inject(EntriesService);
  private tagsService = inject(TagsService);
  private toastService = inject(ToastService);
  entryModel = signal<EntryAlt>({
    title: '',
    date: null,
    tweetIds: '',
    body: '',
    tags: [],
    isPublished: 'true'
  });
  entryForm = form(this.entryModel);
  isEditing = signal<boolean>(false);
  tagsAll = signal<Tag[]>([]);

  constructor() {
    this.route.params.subscribe((params: Params) => {
      if ('id' in params) {
        this.entryId = +params['id'];
        this.isEditing.set(true);
        this.load();
      }
    });
    this.tagsService.adminFetch().subscribe((response: Tag[]) => this.tagsAll.set(response));
  }

  private setExistingEntry(entry: Entry): void {
    this.entryModel.set({
      ...entry,
      date: createNgbDate(new Date(entry.date)),
      tweetIds: entry.tweetIds.join('\n'),
      isPublished: entry.isPublished ? 'true' : 'false'
    });
  }

  load(): void {
    if (!this.entryId) {
      return;
    }
    this.entriesService.adminGet(this.entryId).subscribe((response: Entry) => {
      this.setExistingEntry(response);
    });
  }

  private ngbDateToDateString(date: NgbDate | null): string {
    if (!date) {
      // 未設定の場合は今日の日付をセットする
      return format(new Date(), 'yyyy-MM-dd');
    }
    return format(ngbDateToDate(date), 'yyyy-MM-dd');
  }

  private cleanseTweetIds(idString: string): string[] {
    if (!idString) {
      return [];
    }
    // 18 桁の数字のみを抽出し、重複を削除する
    return [...new Set(idString.split('\n').filter((value: string) => /^\d{18,}$/.test(value)))];
  }

  submit(event: Event): void {
    event.preventDefault();
    const payload: EntryPayload = {
      ...this.entryModel(),
      date: this.ngbDateToDateString(this.entryModel().date),
      tweetIds: this.cleanseTweetIds(this.entryModel().tweetIds),
      isPublished: this.entryModel().isPublished === 'true'
    };
    let promise;
    if (this.isEditing()) {
      promise = this.entriesService.adminPut(this.entryModel().id as number, payload);
    } else {
      promise = this.entriesService.adminPost(payload);
    }
    promise.subscribe((response: Entry) => {
      this.toastService.show({
        body: `記事を${this.isEditing() ? '更新' : '作成'}しました。`,
        classname: 'bg-success text-light'
      });
      this.setExistingEntry(response);
      this.isEditing.set(true);
    });
  }
}