import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entry } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  readonly url: string = '/api/entries/';

  constructor(private http: HttpClient) {}

  fetch(params: any): Observable<HttpResponse<Entry[]>> {
    return this.http.get<Entry[]>(this.url, {
      params: new HttpParams({ fromObject: params }),
      observe: 'response'
    });
  }

  get(entryId: number): Observable<Entry> {
    return this.http.get<Entry>(`${this.url}${entryId}`);
  }
}
