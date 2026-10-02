import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../shared/utils/api-error-message';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly submitting = signal(false);
  readonly form = new FormGroup({
    email: new FormControl('demo@example.com', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('Demo1234!', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const values = this.form.getRawValue();
    this.auth.login(values.email, values.password).subscribe({
      next: () => {
        console.debug('[LoginPage] Connexion réussie');
        this.submitting.set(false);
        void this.router.navigateByUrl('/tracks');
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 'inconnu';
        console.error(`[LoginPage] Échec de connexion (HTTP ${status})`);
        this.error.set(
          error instanceof HttpErrorResponse && error.status === 401
            ? 'Adresse e-mail ou mot de passe incorrect.'
            : apiErrorMessage(error, 'La connexion a échoué. Réessayez.'),
        );
        this.submitting.set(false);
      },
    });
  }
}
