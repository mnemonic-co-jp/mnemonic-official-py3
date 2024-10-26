import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { ToastService } from './shared/services/toast.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NgbToastModule
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  isHome: boolean = false;
  currentYear: string = format(new Date(), 'yyyy');

  constructor(public toastService: ToastService) {};

  onActivate(componentRef: any) {
    this.isHome = componentRef?.name === 'home';
  }
}
