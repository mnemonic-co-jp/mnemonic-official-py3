import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Params } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  imports: [CommonModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class BlogDetailComponent {
  entry: Entry | null = null;

  constructor(
    private route: ActivatedRoute,
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
    });
  }
}
