import { Component, OnInit } from '@angular/core';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  selector: 'app-blog',
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.scss']
})
export class BlogComponent implements OnInit {
  entries: Entry[] | null = null;

  constructor(private entriesService: EntriesService) {}

  ngOnInit(): void {
    this.entriesService.fetch({
      sort: '-date',
      fields: 'title,date,tags'
    }).subscribe((entries: Entry[]) => this.entries = entries );
  }
}
