import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  test: any[] | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any[]>('/api/test/?sort=-date&fields=title').subscribe((test: any[]) => this.test = test );
  }
}
