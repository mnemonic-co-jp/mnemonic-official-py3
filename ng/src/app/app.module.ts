import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { clock, tag, HeroIconModule } from 'ng-heroicon';
import { RECAPTCHA_V3_SITE_KEY, RecaptchaV3Module } from 'ng-recaptcha';
import { NgxTwitterWidgetsModule } from 'ngx-twitter-widgets';
import { MarkdownModule } from 'ngx-markdown';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { ContactComponent } from './contact/contact.component';
import { CoreInterceptor } from './shared/interceptors/core.interceptor';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AboutComponent,
    BlogComponent,
    BlogDetailComponent,
    ContactComponent,
    PageNotFoundComponent
  ],
  imports: [
    BrowserModule,
    ReactiveFormsModule,
    HttpClientModule,
    HeroIconModule.forRoot({
      clock,
      tag
    }, {
      defaultHostDisplay: 'inlineBlock',
      attachDefaultDimensionsIfNoneFound: true
    }),
    AppRoutingModule,
    RecaptchaV3Module,
    NgxTwitterWidgetsModule,
    MarkdownModule.forRoot()
  ],
  providers: [
    { provide: RECAPTCHA_V3_SITE_KEY, useValue: '6Lcl_3MeAAAAANxWTdd4BHMG9WflFiTowhKk3JDK' },
    { provide: HTTP_INTERCEPTORS, useClass: CoreInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
