import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResponse } from '@angular/common/http';
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
  readonly title: string = '';
  private entriesService = inject(EntriesService);
  entries = signal<Entry[]>([]);
  entriesAreLoading = signal<boolean>(false);

  constructor() {
    this.fetchRecentEntries();
  }

  fetchRecentEntries(): void {
    this.entriesAreLoading.set(true);
    // ブログ記事の最新 n 件を取得
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date',
      limit: NUM_OF_ENTRIES
    }).subscribe({
      next: (response: HttpResponse<Entry[]>) => {
        this.entries.set(response.body as Entry[]);
        this.entriesAreLoading.set(false);
      },
      error: () => this.entriesAreLoading.set(false)
    });
  }
}
