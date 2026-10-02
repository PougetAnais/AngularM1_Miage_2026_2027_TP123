import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { apiErrorMessage } from '../../shared/utils/api-error-message';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  imports: [ReactiveFormsModule],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css',
})
export class ProfilePageComponent implements OnInit {
  private readonly auth = inject(AuthService);
  readonly currentUser = this.auth.currentUser;
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly success = signal('');
  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.error.set('');
    this.success.set('');
    this.loading.set(true);
    this.auth.profile().subscribe({
      next: (user) => {
        console.debug('[ProfilePage] Profil chargé', user.id);
        this.form.setValue({ name: user.name });
        this.loading.set(false);
      },
      error: (error: unknown) => {
        this.logError('Chargement impossible', error);
        this.error.set(apiErrorMessage(error, 'Impossible de charger le profil.'));
        this.loading.set(false);
      },
    });
  }

  save(): void {
    this.error.set('');
    this.success.set('');
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.auth.update(this.form.getRawValue().name.trim()).subscribe({
      next: (user) => {
        console.debug('[ProfilePage] Profil enregistré', user.id);
        this.success.set('Votre nom a été mis à jour.');
        this.saving.set(false);
      },
      error: (error: unknown) => {
        this.logError('Enregistrement impossible', error);
        this.error.set(apiErrorMessage(error, 'Impossible de mettre à jour le profil.'));
        this.saving.set(false);
      },
    });
  }

  private logError(action: string, error: unknown): void {
    const status =
      typeof error === 'object' && error !== null && 'status' in error
        ? error.status
        : 'inconnu';
    console.error(`[ProfilePage] ${action} (HTTP ${status})`);
  }
}
