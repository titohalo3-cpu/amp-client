import { Injectable, signal } from '@angular/core';

export interface Aviso {
  texto: string;
  tipo: 'ok' | 'error';
}

/** Mensajes flotantes ("toast") que se muestran unos segundos. */
@Injectable({ providedIn: 'root' })
export class NotificationService {
  readonly aviso = signal<Aviso | null>(null);
  private temporizador?: ReturnType<typeof setTimeout>;

  ok(texto: string): void {
    this.mostrar({ texto, tipo: 'ok' });
  }

  error(texto: string): void {
    this.mostrar({ texto, tipo: 'error' });
  }

  private mostrar(aviso: Aviso): void {
    this.aviso.set(aviso);
    clearTimeout(this.temporizador);
    this.temporizador = setTimeout(() => this.aviso.set(null), 3500);
  }
}
