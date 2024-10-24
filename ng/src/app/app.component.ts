import { Component } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { format } from 'date-fns';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isHome: boolean = false;
  currentYear: string = format(new Date(), 'yyyy');

  onActivate(componentRef: any) {
    this.isHome = componentRef?.name === 'home';
  }
}
