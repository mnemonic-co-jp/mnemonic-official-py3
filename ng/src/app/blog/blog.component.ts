import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

interface EntryAlt extends Entry {
  tagString: string;
}

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
  entries: EntryAlt[] | null = null;
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
        this.entries = entries.map((entry: Entry) => ({
          ...entry,
          tagString: entry.tags.join(', ')
        }));
        this.entriesAreLoading = false;
      },
      error: () => this.entriesAreLoading = false
    });
  }
}
