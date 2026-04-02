import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss'
})
export class AboutComponent {
  readonly name: string = 'about';
  readonly title: string = 'ニーモニックについて';
  readonly description: string = '会社紹介・概要のページです。';
  readonly keywords: string = ',会社概要';
}
