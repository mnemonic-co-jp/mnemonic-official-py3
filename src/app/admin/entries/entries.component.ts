import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../../shared/services/entries.service';
import { Entry } from '../../shared/models/entry.model';
import { ToastService } from '../../shared/services/toast.service';

interface EntryRequestParams {
  cursor?: string;
}

@Component({
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss',
})
export class AdminEntriesComponent {
  private entriesService = inject(EntriesService);
  private toastService = inject(ToastService);
  entries = signal<Entry[]>([]);
  entriesAreLoading = signal<boolean>(false);
  page = signal<number>(1);
  cursors = signal<(string | null)[]>([null]);

  constructor() {
    this.fetchEntries();
  }

  fetchEntries(): void {
    this.entriesAreLoading.set(true);
    const params: EntryRequestParams = {};
    const cursor = this.cursors()[this.page() - 1];
    if (cursor) {
      params.cursor = cursor;
    }
    this.entriesService.adminFetch(params).subscribe({
      next: (response: HttpResponse<Entry[]>) => {
        this.entries.set(response.body as Entry[]);
        this.entriesAreLoading.set(false);
        const nextCursor = response.headers.get('X-Next-Cursor');
        if (nextCursor) {
          if (!this.cursors()[this.page() - 2]) {
            this.cursors.update(value => [...value, nextCursor]);
          }
        }
      },
      error: () => this.entriesAreLoading.set(false)
    });
  }

  deleteEntry(event: Event, entry: Entry): void {
    event.preventDefault();
    if (window.confirm(`記事「${entry.title}」を削除してもよろしいですか？`)) {
      this.entriesService.adminDelete(entry.id).subscribe({
        next: () => {
          this.entries.set(this.entries().map((_entry: Entry) => {
            if (_entry.id === entry.id) {
              _entry.isDeleted = true;
            }
            return _entry;
          }));
          this.toastService.show({
            body: '記事を削除しました。',
            classname: 'bg-success text-light'
          });
        }
      });
    }
  }

  jumpTo(direction: number): void {
    this.page.update(value => value + direction);
    this.fetchEntries();
  }
}
