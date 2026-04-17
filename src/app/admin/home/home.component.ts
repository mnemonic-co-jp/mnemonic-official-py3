import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class AdminHomeComponent {
  constructor(private http: HttpClient) {
    this.http.get<void>('/admin/api/test/').subscribe(() => {});
  }
}
