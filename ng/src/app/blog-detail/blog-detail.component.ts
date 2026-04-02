import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { Title, Meta } from "@angular/platform-browser";
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
  readonly title: string = 'ブログ記事';
  readonly description: string = 'ブログ記事のページです。';
  readonly keywords: string = ',ブログ';

  entry: Entry | null = null;

  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private meta: Meta,
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
      this.titleService.setTitle(`ブログ記事: ${entry.title} | ${this.titleService.getTitle()}`);
      // description を変更
      this.meta.updateTag({
        name: 'description',
        content: `株式会社ニーモニックのオフィシャルサイト。ブログ記事"${entry.title}"のページです。`
      });
      // keywords も変更
      this.meta.updateTag({
        name: 'keywords',
        content: `Mnemonic,ニーモニック,ニモニク,システム開発,エンジニア,ブログ,${entry.tags}`
      });
    });
  }
}
