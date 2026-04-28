import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tag } from '../models/tag.model';

@Injectable({
  providedIn: 'root'
})
export class TagsService {
  private http = inject(HttpClient);

  adminFetch(): Observable<Tag[]> {
    return this.http.get<Tag[]>('/admin/api/tags/');
  }
}
