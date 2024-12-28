import { Routes } from '@angular/router';
import { BaseComponent } from './base/base.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: BaseComponent, children: [
    { path: '', component: HomeComponent }
  ]}
];
