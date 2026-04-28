import { Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { HomeComponent } from './home/home.component';
import { AboutComponent } from './about/about.component';
import { BlogComponent } from './blog/blog.component';
import { BlogDetailComponent } from './blog-detail/blog-detail.component';
import { InquiryComponent } from './inquiry/inquiry.component';
import { AdminBaseComponent } from './admin/base/base.component';
import { AdminHomeComponent } from './admin/home/home.component';
import { AdminEntriesComponent } from './admin/entries/entries.component';
import { AdminEntryComponent } from './admin/entry/entry.component';
import { NotFoundComponent } from './not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: '', component: HomeComponent },
    { path: 'about', component: AboutComponent },
    { path: 'blog', component: BlogComponent },
    { path: 'blog/:id', component: BlogDetailComponent },
    { path: 'blog/:id/:action', component: BlogDetailComponent },
    { path: 'inquiry', component: InquiryComponent }
  ]},
  { path: 'admin', component: AdminBaseComponent, children: [
    { path: '', component: AdminHomeComponent },
    { path: 'entries', component: AdminEntriesComponent },
    { path: 'entry', component: AdminEntryComponent },
    { path: 'entry/:id', component: AdminEntryComponent }
  ]},
  { path: '**', component: BaseComponent, children: [
    { path: '**', component: NotFoundComponent }
  ]}
];
