import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
  });

  it('se crea la aplicación', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sin sesión el menú solo muestra Entrar y Registro', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const texto = (fixture.nativeElement as HTMLElement).querySelector('.menu')?.textContent ?? '';
    expect(texto).toContain('Entrar');
    expect(texto).toContain('Registro');
    expect(texto).not.toContain('Gestión');
  });
});
