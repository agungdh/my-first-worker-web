import { HttpErrorResponse } from '@angular/common/http';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { LoginPage } from './login-page';

@Component({ template: '' })
class BlankPage {}

describe('LoginPage', () => {
  const auth = {
    login: vi.fn(() => of({ id: 1, username: 'admin', name: 'Admin User' })),
  };

  beforeEach(async () => {
    auth.login.mockClear();
    auth.login.mockImplementation(() => of({ id: 1, username: 'admin', name: 'Admin User' }));

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([{ path: 'dashboard', component: BlankPage }]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();
  });

  it('renders the credential fields', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    expect(inputs.length).toBe(2);
    expect(inputs[0].getAttribute('autocomplete')).toBe('username');
    expect(inputs[1].getAttribute('autocomplete')).toBe('current-password');
  });

  it('submits the typed credentials', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    inputs[0].value = 'admin';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'Admin123!';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();

    expect(auth.login).toHaveBeenCalledWith({
      username: 'admin',
      password: 'Admin123!',
    });
  });

  it('blocks submission and shows inline errors when credentials are empty', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(auth.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.textContent).toContain('Username is required.');
    expect(fixture.nativeElement.textContent).toContain('Password is required.');
  });

  it('shows the backend error when sign in fails', async () => {
    auth.login.mockImplementation(() =>
      throwError(
        () =>
          new HttpErrorResponse({
            status: 401,
            error: { success: false, errors: [{ code: 7003, message: 'Unauthorized' }] },
          }),
      ),
    );

    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    inputs[0].value = 'admin';
    inputs[0].dispatchEvent(new Event('input'));
    inputs[1].value = 'wrong-password';
    inputs[1].dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.textContent).toContain('Invalid username or password.');
  });
});
