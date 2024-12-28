import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { ToastService } from '../shared/services/toast.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NgbToastModule
  ],
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent {
  isHome: boolean = true;
  currentYear: string = format(new Date(), 'yyyy');

  constructor(public toastService: ToastService) {};

  onActivate(componentRef: any) {
    this.isHome = componentRef?.name === 'home';
  }
}
