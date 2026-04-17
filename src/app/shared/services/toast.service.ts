import { Injectable } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  toasts: Toast[] = [];

  show(options: Toast): void {
    this.toasts.push({...options});
  }

  remove(toast: Toast) {
    this.toasts = this.toasts.filter((t: Toast) => t !== toast);
  }
}
