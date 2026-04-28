import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { form, FormField, required, email, validateTree, RootFieldContext } from '@angular/forms/signals';
import { HttpClient } from '@angular/common/http';
import { RecaptchaV3Module, ReCaptchaV3Service } from 'ng-recaptcha';
import { ToastService } from '../shared/services/toast.service';

interface Inquiry {
  name: string;
  phone: string;
  email: string;
  body: string;
}

@Component({
  imports: [
    CommonModule,
    FormField,
    RecaptchaV3Module
  ],
  templateUrl: './inquiry.component.html',
  styleUrl: './inquiry.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InquiryComponent {
  readonly name: string = 'inquiry';
  readonly title: string = 'お問い合わせ';
  readonly description: string = 'お問い合わせページです。';
  readonly keywords: string = ',問合せ,問い合わせ,お問合せ,お問い合わせ';
  private http = inject(HttpClient);
  private recaptchaV3Service = inject(ReCaptchaV3Service);
  private toastService = inject(ToastService);
  inquiryModel = signal<Inquiry>({
    name: '',
    phone: '',
    email: '',
    body: ''
  });
  inquiryForm = form(this.inquiryModel, schemaPath => {
    required(schemaPath.name, { message: 'この項目は必須です。' });
    const requirePhoneOrEmail = (ctx: RootFieldContext<Inquiry>, name: keyof Inquiry) => {
      if (!ctx.valueOf(schemaPath.phone) && !ctx.valueOf(schemaPath.email)) {
        return {
          kind: 'requirePhoneOrEmail',
          message: 'お電話番号とメールアドレスのどちらかはご入力ください。',
          fieldTree: ctx.fieldTree[name]
        }
      }
      return null;
    };
    validateTree(schemaPath, ctx => requirePhoneOrEmail(ctx, 'phone'));
    validateTree(schemaPath, ctx => requirePhoneOrEmail(ctx, 'email'));
    email(schemaPath.email, { message: '不正なメールアドレスです。' });
    required(schemaPath.body, { message: 'この項目は必須です。' });
  });
  isValidating = signal<boolean>(false);

  submit(event: Event): void {
    event.preventDefault();
    this.isValidating.set(true);
    if (this.inquiryForm.name().invalid() || this.inquiryForm.phone().invalid() || this.inquiryForm.email().invalid() || this.inquiryForm.body().invalid()) {
      return;
    }
    this.isValidating.set(false);
    this.recaptchaV3Service.execute('mnemonic').subscribe((token: string) => {
      this.http.post('/api/inquiry/', {
        ...this.inquiryModel(),
        token: token
      }).subscribe(() => {
        this.inquiryModel.set({
          name: '',
          phone: '',
          email: '',
          body: ''
        });
        this.toastService.show({
          body: 'お問い合わせを受け付けました。',
          classname: 'bg-success text-light'
        });
      });
    });
  }
}
