import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'info';

export interface Toast {
  message: string;
  type: ToastType;
  id: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  toasts = signal<Toast[]>([]);
  private counter = 0;

  show(message: string, type: ToastType = 'success', duration = 3000) {
    const id = ++this.counter;
    this.toasts.set([...this.toasts(), { message, type, id }]);

    setTimeout(() => {
      this.toasts.set(this.toasts().filter(t => t.id !== id));
    }, duration);
  }
}
