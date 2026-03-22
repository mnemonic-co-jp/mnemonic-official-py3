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
}
