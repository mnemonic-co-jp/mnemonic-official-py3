import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
import { GoogleAdsenseDirective } from '../shared/directives/google-adsense.directive';
import { ToastService } from '../shared/services/toast.service';

interface ComponentRef {
  name?: string;
  title?: string;
}

const BASE_TITLE = 'ニモニク - 株式会社ニーモニック';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    NgbToastModule,
    GoogleAdsenseDirective
  ],
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent {
  isHome: boolean = true;
  currentYear: string = format(new Date(), 'yyyy');

  constructor(
    private titleService: Title,
    public toastService: ToastService
  ) {
    this.titleService.setTitle(BASE_TITLE);
  };

  onActivate(componentRef: ComponentRef) {
    // NOTE: 変更タイミングをずらさないと NG0100 のエラーになる
    setTimeout(() => this.isHome = componentRef?.name === 'home');
    const title = componentRef?.title;
    this.titleService.setTitle(title ? `${title} | ${BASE_TITLE}` : BASE_TITLE);
  }
}
