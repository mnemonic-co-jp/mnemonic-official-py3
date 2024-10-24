import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { ActivatedRoute, Params } from '@angular/router';
import { EntriesService } from '../shared/services/entries.service';
import { Entry } from '../shared/models/entry.model';

@Component({
  selector: 'app-blog-detail',
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss']
})
export class BlogDetailComponent implements OnInit {
  entry: Entry | null = null;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private entriesService: EntriesService
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      const entryId: number = +params['id'];
      this.getEntry(entryId);
    });
  }

  getEntry(entryId: number): void {
    this.entriesService.get(entryId).subscribe((entry: Entry) => {
      this.entry = entry;
    });
  }
}
