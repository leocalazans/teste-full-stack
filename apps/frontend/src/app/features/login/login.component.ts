// src/app/features/login/login.component.ts
import { Component, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { catchError, finalize, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { LogoComponent } from '../../components/logo/logo.component';
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LogoComponent],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);
  imageUrl: string = '/images/bg-form-login.webp'
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submitted = false;
  loading = false;
  error: string | null = null;
  showPassword = false;

  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    this.submitted = true;
    this.error = null;

    if (this.form.invalid) return;

    this.loading = true;
    const { email, password } = this.form.value;

    this.auth.login(email!, password!).pipe(
      tap(() => this.router.navigateByUrl('/dashboard')),
      catchError(err => {
        this.error = err?.error?.message ?? 'Credenciais inválidas. Tente novamente.';
        return of(null);
      }),
      finalize(() => { this.loading = false; })
    ).subscribe();
  }
}
