import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { ToastService } from '../shared/services/toast.service';

interface Errors {
  name: string;
  phone: string;
  email: string;
  body: string;
}

const EMAIL_REGEXP = new RegExp('^([a-zA-Z0-9])+([a-zA-Z0-9\+\._-])*@([a-zA-Z0-9_-])+([a-zA-Z0-9\._-]+)+$');

@Component({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RecaptchaV3Module
  ],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.scss',
})
export class InquiryComponent {
  readonly title: string = 'お問い合わせ';
  inquiryForm: FormGroup;
  errors: Errors = {
    name: '',
    phone: '',
    email: '',
    body: ''
  }

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private recaptchaV3Service: ReCaptchaV3Service,
    private toastService: ToastService
  ) {
    this.inquiryForm = this.formBuilder.group({
      name: [''],
      phone: [''],
      email: [''],
      body: ['']
    });
  }

  submit(): void {
    this.errors= {
      name: '',
      phone: '',
      email: '',
      body: ''
    };
    const value = this.inquiryForm.value;
    if (!value.name) {
      this.errors.name = 'この項目は必須です。'
    }
    if (!value.phone && !value.email) {
      this.errors.phone = 'お電話番号とメールアドレスのどちらかはご入力ください。';
      this.errors.email = 'お電話番号とメールアドレスのどちらかはご入力ください。';
    } else if (value.email && !value.email.match(EMAIL_REGEXP)) {
      this.errors.email = '不正なメールアドレスです。';
    }
    if (!value.body) {
      this.errors.body = 'この項目は必須です。'
    }
    if (Object.values(this.errors).some((item: string) => item)) {
      return;
    }
    this.recaptchaV3Service.execute('mnemonic').subscribe((token: string) => {
      this.http.post('/api/inquiry/', {
        ...value,
        token: token
      }).subscribe(() => {
        this.inquiryForm.reset();
        this.toastService.show({
          body: 'お問い合わせを受け付けました。',
          classname: 'bg-success text-light'
        });
      });
    });
  }
}
