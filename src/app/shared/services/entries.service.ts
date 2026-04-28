import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entry, EntryPayload } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  private http = inject(HttpClient);

  fetch(params: any): Observable<HttpResponse<Entry[]>> {
    return this.http.get<Entry[]>('/api/entries/', {
      params: new HttpParams({ fromObject: params }),
      observe: 'response'
    });
  }

  get(entryId: number, isPreview: boolean = false): Observable<Entry> {
    return this.http.get<Entry>(`/api/entries/${entryId}${isPreview ? '/preview/' : ''}`);
  }

  adminFetch(params: any): Observable<HttpResponse<Entry[]>> {
    return this.http.get<Entry[]>('/admin/api/entries/', {
      params: new HttpParams({ fromObject: params }),
      observe: 'response'
    });
  }

  adminGet(entryId: number): Observable<Entry> {
    return this.http.get<Entry>(`/admin/api/entries/${entryId}`);
  }

  adminPost(params: EntryPayload): Observable<Entry> {
    return this.http.post<Entry>('/admin/api/entries/', params);
  }

  adminPut(entryId: number, params: EntryPayload): Observable<Entry> {
    return this.http.put<Entry>(`/admin/api/entries/${entryId}`, params);
  }

  adminDelete(entryId: number): Observable<void> {
    return this.http.delete<void>(`/admin/api/entries/${entryId}`);
  }
}
