import { Component } from '@angular/core';

@Component({
  imports: [],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  readonly name: string = 'not-found';
  readonly title: string = 'ページが見つかりません';
}
