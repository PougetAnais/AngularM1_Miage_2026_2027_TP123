import { DatePipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Track } from '../../shared/models/track.model';
import { TrackService } from '../../shared/services/track.service';
import { apiErrorMessage } from '../../shared/utils/api-error-message';

@Component({
  imports: [DatePipe, ReactiveFormsModule],
  templateUrl: './tracks-page.html',
  styleUrl: './tracks-page.css',
})
export class TracksPageComponent implements OnDestroy {
  private readonly service = inject(TrackService);
  private fileInput?: HTMLInputElement;

  readonly tracks = signal<Track[]>([]);
  readonly page = signal(1);
  readonly pages = signal(1);
  readonly loading = signal(false);
  readonly audioUrl = signal('');
  readonly error = signal('');
  readonly uploading = signal(false);
  readonly uploadError = signal('');
  readonly uploadSuccess = signal('');
  readonly nowPlaying = signal<Track | null>(null);
  readonly audioLoading = signal(false);
  readonly audioError = signal('');
  readonly title = new FormControl('', { nonNullable: true });
  file?: File;

  constructor() {
    this.load();
  }

  choose(event: Event): void {
    this.fileInput = event.target as HTMLInputElement;
    this.file = this.fileInput.files?.[0];
    this.uploadError.set(this.file ? this.validateFile(this.file) : '');
    this.uploadSuccess.set('');
    console.debug('[TracksPage] Fichier sélectionné', this.file?.name);
  }

  load(): void {
    this.loading.set(true);
    this.error.set('');
    this.service.list(this.page()).subscribe({
      next: (response) => {
        console.debug('[TracksPage] Pistes chargées', response.items.length);
        this.tracks.set(response.items);
        this.pages.set(response.pages);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('[TracksPage] Chargement impossible', error);
        this.error.set(apiErrorMessage(error, 'Impossible de charger les pistes.'));
        this.loading.set(false);
      },
    });
  }

  go(page: number): void {
    if (page < 1 || page > this.pages() || page === this.page() || this.loading()) {
      return;
    }

    this.page.set(page);
    this.load();
  }

  upload(): void {
    if (this.uploading()) return;
    if (!this.file) {
      this.uploadError.set('Choisissez un fichier audio.');
      return;
    }

    const validationError = this.validateFile(this.file);
    if (validationError) {
      this.uploadError.set(validationError);
      return;
    }

    this.uploading.set(true);
    this.uploadError.set('');
    this.uploadSuccess.set('');
    this.service.upload(this.file, this.title.value || this.file.name).subscribe({
      next: (track) => {
        console.debug('[TracksPage] Piste envoyée', track.id);
        this.uploading.set(false);
        this.uploadSuccess.set('La piste a été envoyée avec succès.');
        this.title.setValue('');
        this.file = undefined;
        if (this.fileInput) this.fileInput.value = '';
        this.page.set(1);
        this.load();
      },
      error: (error) => {
        console.error('[TracksPage] Envoi impossible', error);
        this.uploadError.set(apiErrorMessage(error, "Impossible d'envoyer la piste."));
        this.uploading.set(false);
      },
    });
  }

  play(track: Track): void {
    if (this.audioLoading()) return;

    this.audioLoading.set(true);
    this.audioError.set('');
    this.service.audio(track.id).subscribe({
      next: (blob) => {
        console.debug('[TracksPage] Audio chargé', track.id);
        const previousUrl = this.audioUrl();
        if (previousUrl) URL.revokeObjectURL(previousUrl);
        this.audioUrl.set(URL.createObjectURL(blob));
        this.nowPlaying.set(track);
        this.audioLoading.set(false);
      },
      error: (error) => {
        console.error('[TracksPage] Lecture impossible', error);
        this.audioError.set(apiErrorMessage(error, 'Impossible de charger ce morceau.'));
        this.audioLoading.set(false);
      },
    });
  }

  onAudioError(): void {
    this.audioError.set('Le lecteur ne peut pas lire ce fichier audio.');
  }

  formatSize(size: number): string {
    return `${(size / 1024).toFixed(1)} Ko`;
  }

  ngOnDestroy(): void {
    const audioUrl = this.audioUrl();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }

  private validateFile(file: File): string {
    const allowedTypes = [
      'audio/mpeg',
      'audio/wav',
      'audio/x-wav',
      'audio/ogg',
      'audio/mp4',
      'audio/x-m4a',
    ];

    if (!allowedTypes.includes(file.type)) {
      return 'Format refusé. Choisissez un fichier MP3, WAV, OGG ou M4A.';
    }

    if (file.size > 25 * 1024 * 1024) {
      return 'Le fichier ne doit pas dépasser 25 Mo.';
    }

    return '';
  }
}
