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
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  name: string = 'home';

  entries: Entry[] | null = null;

  constructor(private entriesService: EntriesService) {
    this.fetchRecentEntries(5);
  }

  fetchRecentEntries(limit: number): void {
    // ブログ記事の最新 n 件を取得
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date',
      limit: limit
    }).subscribe((entries: Entry[]) => this.entries = entries);
  }
}
