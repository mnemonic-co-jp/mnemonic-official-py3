import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

const NUM_OF_ENTRIES = 5;

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  readonly name: string = 'home';
  
  entries: Entry[] | null = null;
  entriesAreLoading: boolean = false;

  constructor(private entriesService: EntriesService) {
    this.fetchRecentEntries();
  }

  fetchRecentEntries(): void {
    this.entriesAreLoading = true;
    // ブログ記事の最新 n 件を取得
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date',
      limit: NUM_OF_ENTRIES
    }).subscribe({
      next: (entries: Entry[]) => {
        this.entries = entries;
        this.entriesAreLoading = false;
      },
      error: () => this.entriesAreLoading = false
    });
  }
}
