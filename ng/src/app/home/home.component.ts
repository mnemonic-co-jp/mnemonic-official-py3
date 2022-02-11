import { Component, OnInit } from '@angular/core';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  entries: Entry[] | null = null;

  constructor(private entriesService: EntriesService) {}

  ngOnInit(): void {
    // ブログ記事の最新 5 件を取得
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date',
      limit: 5
    }).subscribe((entries: Entry[]) => this.entries = entries);
  }
}
