import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof HttpErrorResponse) {
    if (error.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez que le backend est démarré.';
    }

    const body: unknown = error.error;
    if (typeof body === 'object' && body !== null && 'message' in body) {
      const message = body.message;
      if (typeof message === 'string' && message.trim()) {
        return message;
      }
    }
  }

  return fallback;
}
