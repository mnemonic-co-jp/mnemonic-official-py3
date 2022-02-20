import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppRoutingModule } from './app-routing.module';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';
import { CoreInterceptor } from './shared/interceptors/core.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    ContactComponent,
    BlogComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    RecaptchaV3Module
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lcl_3MeAAAAANxWTdd4BHMG9WflFiTowhKk3JDK' },
    { provide: HTTP_INTERCEPTORS, useClass: CoreInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
