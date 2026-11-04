import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Login } from './login';

describe('Login', () => {
  let fixture: ComponentFixture<Login>;
  let componente: Login;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Login],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(Login);
    componente = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('se crea', () => {
    expect(componente).toBeTruthy();
  });

  it('el formulario es inválido si está vacío', () => {
    expect(componente['form'].valid).toBeFalse();
  });

  it('marca error con un email mal escrito', () => {
    componente['form'].setValue({ email: 'esto-no-es-un-email', password: '123456' });
    expect(componente['form'].controls.email.hasError('email')).toBeTrue();
  });

  it('es válido con email y contraseña correctos', () => {
    componente['form'].setValue({ email: 'mario@amp.es', password: 'cliente1' });
    expect(componente['form'].valid).toBeTrue();
  });
});
