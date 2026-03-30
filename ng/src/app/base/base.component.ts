import { Component, AfterViewInit, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Title } from "@angular/platform-browser";
import { NgbToastModule } from '@ng-bootstrap/ng-bootstrap';
import { format } from 'date-fns';
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
    NgbToastModule
  ],
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements AfterViewInit {
  isHome: boolean = true;
  currentYear: string = format(new Date(), 'yyyy');

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private titleService: Title,
    public toastService: ToastService
  ) {
    this.titleService.setTitle(BASE_TITLE);
  };

  ngAfterViewInit(): void {
    const hostElement = this.document.getElementById('google-adsense');
    if (!hostElement) {
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.id = `mini-skyscraper-${new Date().getTime()}`;
    script.text = '(adsbygoogle = window.adsbygoogle || []).push({});';
    const parent = hostElement.parentNode;
    if (parent) {
      parent.replaceChild(script, hostElement);
    }
  }

  onActivate(componentRef: ComponentRef) {
    // NOTE: 変更タイミングをずらさないと NG0100 のエラーになる
    setTimeout(() => this.isHome = componentRef?.name === 'home');
    const title = componentRef?.title;
    this.titleService.setTitle(title ? `${title} | ${BASE_TITLE}` : BASE_TITLE);
  }
}
