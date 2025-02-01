import { Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { HomeComponent } from './home/home.component';
import { AdminBaseComponent } from './admin/base/base.component';
import { AdminHomeComponent } from './admin/home/home.component';

export const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: '', component: HomeComponent }
  ]},
  { path: 'admin', component: AdminBaseComponent, children: [
    { path: '', component: AdminHomeComponent }
  ]}
];
