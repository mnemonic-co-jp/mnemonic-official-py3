import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Entry } from '../models/entry.model';

@Injectable({
  providedIn: 'root'
})
export class EntriesService {
  readonly url: string = '/api/entries/';

  constructor(private http: HttpClient) {}

  fetch(params: any): Observable<Entry[]> {
    return this.http.get<Entry[]>(this.url, {
      params: new HttpParams({
        fromObject: params
      })
    });
  }
}
