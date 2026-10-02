import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { apiErrorMessage } from '../../shared/utils/api-error-message';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.css',
})
export class RegisterPageComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly error = signal('');
  readonly submitting = signal(false);
  readonly form = new FormGroup({
    name: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.pattern(/\S/)],}),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', {nonNullable: true,validators: [Validators.required, Validators.minLength(8)],}),
  });

  submit(): void {
    this.error.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const values = this.form.getRawValue();
    this.auth.register(values.name.trim(), values.email, values.password).subscribe({
      next: () => {
        console.debug('[RegisterPage] Inscription réussie');
        this.submitting.set(false);
        void this.router.navigateByUrl('/profile');
      },
      error: (error: unknown) => {
        const status = error instanceof HttpErrorResponse ? error.status : 'inconnu';
        console.error(`[RegisterPage] Échec de l’inscription (HTTP ${status})`);
        this.error.set(apiErrorMessage(error, 'La création du compte a échoué. Réessayez.'));
        this.submitting.set(false);
      },
    });
  }
}
