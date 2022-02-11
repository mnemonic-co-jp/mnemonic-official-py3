import { Component } from '@angular/core';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { format } from 'date-fns';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  currentYear: string = format(new Date(), 'yyyy'); // フッタの Copyright 表記用

  constructor(
    private router: Router
  ) {
    // home に遷移した時は body に特別な id を付与する（専用 CSS 適用のため）
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((e) => {
      document.body.id = (e as RouterEvent).url === '/' ? 'page-home' : '';
    });
  }
}
