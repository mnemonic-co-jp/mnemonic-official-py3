import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

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
  readonly title: string = 'ブログ記事一覧';
  entries: Entry[] | null = null;
  entriesAreLoading: boolean = false;

  constructor(private entriesService: EntriesService) {
    this.fetchEntries();
  }

  fetchEntries(): void {
    this.entriesAreLoading = true;
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date,tags'
    }).subscribe({
      next: (entries: Entry[]) => {
        this.entries = entries;
        this.entriesAreLoading = false;
      },
      error: () => this.entriesAreLoading = false
    });
  }

  getJoinedTag(entry: Entry): string {
    return entry.tags.join(', ');
  }
}
