import { Directive, AfterViewInit, Input, ElementRef, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Directive({
  selector: '[appGoogleAdsense]',
  standalone: true
})
export class GoogleAdsenseDirective implements AfterViewInit {
  @Input() public adId: string = '';

  constructor(
    private el: ElementRef,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngAfterViewInit(): void {
    const hostElement = this.el.nativeElement as HTMLElement;
    if (!hostElement) {
      return;
    }
    const script = this.document.createElement('script');
    script.type = 'text/javascript';
    script.id = this.adId;
    script.text = '(adsbygoogle = window.adsbygoogle || []).push({});';
    const parent = hostElement.parentNode;
    if (parent) {
      parent.replaceChild(script, hostElement);
    }
  }
}
