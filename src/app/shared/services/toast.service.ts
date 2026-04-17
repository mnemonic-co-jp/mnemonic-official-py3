import { Injectable, signal, computed } from '@angular/core';
import { Toast } from '../models/toast.model';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastItems = signal<Toast[]>([]);

  readonly toasts = computed(() => this.toastItems())

  show(options: Toast): void {
    this.toastItems.update(value => [...value, {...options}]);
  }

  remove(toast: Toast) {
    this.toastItems.update(value => this.toastItems().filter((t: Toast) => t !== toast));
  }
}
