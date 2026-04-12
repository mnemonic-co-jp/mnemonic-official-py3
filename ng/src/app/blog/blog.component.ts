import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

interface EntryRequestParams {
  sort: string;
  fields: string;
  limit: number;
  cursor?: string;
}

const PER_PAGE = 20;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './blog.component.html',
  styleUrl: './blog.component.scss',
})
export class BlogComponent {
  readonly name: string = 'blog';
  readonly title: string = 'ブログ記事一覧';
  readonly description: string = 'ブログ記事一覧のページです。';
  readonly keywords: string = ',ブログ';

  entries: Entry[] | null = null;
  entriesAreLoading: boolean = false;
  page: number = 1;
  cursors: (string | null)[] = [null];

  constructor(private entriesService: EntriesService) {
    this.fetchEntries();
  }

  fetchEntries(): void {
    this.entriesAreLoading = true;
    const params: EntryRequestParams = {
      sort: '-date',
      fields: 'title,date,tags',
      limit: PER_PAGE
    };
    const cursor = this.cursors[this.page - 1];
    if (cursor) {
      params.cursor = cursor;
    }
    this.entriesService.fetch(params).subscribe({
      next: (response: HttpResponse<Entry[]>) => {
        this.entries = response.body as Entry[];
        this.entriesAreLoading = false;
        const nextCursor = response.headers.get('X-Next-Cursor');
        if (nextCursor) {
          if (!this.cursors[this.page - 2]) {
            this.cursors.push(nextCursor);
          }
        }
      },
      error: () => this.entriesAreLoading = false
    });
  }

  getJoinedTag(entry: Entry): string {
    return entry.tags.join(', ');
  }

  jumpTo(direction: number): void {
    this.page += direction;
    this.fetchEntries();
  }
}
