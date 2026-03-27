import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { NgxTwitterWidgetsModule } from "ngx-twitter-widgets";
import { MarkdownComponent } from 'ngx-markdown';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  imports: [
    CommonModule,
    RouterModule,
    NgxTwitterWidgetsModule,
    MarkdownComponent
  ],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent {
  readonly name: string = 'blog-detail';
  readonly pageTitle: string = 'ブログ記事';
  entry: Entry | null = null;

  constructor(
    private route: ActivatedRoute,
    private title: Title,
    private entriesService: EntriesService
  ) {
    this.route.params.subscribe((params: Params) => {
      const entryId: number = +params['id'];
      this.getRecentEntry(entryId);
    });
  }

  getRecentEntry(entryId: number) {
    this.entriesService.get(entryId).subscribe((entry: Entry) => {
      this.entry = entry;
      // ページタイトルに記事名を付与する
      this.title.setTitle(`ブログ記事: ${entry.title} | ${this.title.getTitle()}`);
    });
  }
}
