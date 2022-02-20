import { Component, OnInit } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ReCaptchaV3Service } from 'ng-recaptcha';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup = this.formBuilder.group({
    name: [''],
    phone: [''],
    email: [''],
    body: ['']
  });

  constructor(
    private title: Title,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private recaptchaV3Service: ReCaptchaV3Service
  ) {
    this.title.setTitle('お問い合わせ | ニモニク - 株式会社ニーモニック');
  }

  ngOnInit(): void {
  }

  submit(): void {
    this.recaptchaV3Service.execute('submitContact').subscribe((token: string) => {
      this.http.post('/api/contact/', {
        name: 'hoge',
        body: 'fuga',
        token: token
      }).subscribe(() => {});
    });
  }
}
