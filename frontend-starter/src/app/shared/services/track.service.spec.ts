import { HttpEventType, provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TrackService } from './track.service';

describe('TrackService', () => {
  let service: TrackService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(TrackService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends the requested page and limit', () => {
    service.list(2, 10).subscribe((response) => {
      expect(response.page).toBe(2);
      expect(response.limit).toBe(10);
    });

    const request = http.expectOne('/api/tracks?page=2&limit=10');
    expect(request.request.method).toBe('GET');
    request.flush({ items: [], page: 2, limit: 10, total: 0, pages: 1 });
  });

  it('sends audio and title as multipart data and reports upload progress', () => {
    const file = new File(['audio'], 'demo.mp3', { type: 'audio/mpeg' });
    const receivedEvents: HttpEventType[] = [];

    service.upload(file, 'Demo').subscribe((event) => receivedEvents.push(event.type));

    const request = http.expectOne('/api/tracks');
    expect(request.request.method).toBe('POST');
    expect(request.request.reportProgress).toBe(true);
    expect(request.request.body).toBeInstanceOf(FormData);
    expect(request.request.body.get('audio')).toBe(file);
    expect(request.request.body.get('title')).toBe('Demo');
    request.event({ type: HttpEventType.UploadProgress, loaded: 50, total: 100 });
    request.flush({
      id: 'track-1',
      title: 'Demo',
      originalName: 'demo.mp3',
      mimeType: 'audio/mpeg',
      size: 5,
      createdAt: '2026-11-01T00:00:00.000Z',
    });

    expect(receivedEvents).toContain(HttpEventType.UploadProgress);
    expect(receivedEvents).toContain(HttpEventType.Response);
  });

  it('deletes a track by id', () => {
    service.delete('track-1').subscribe();

    const request = http.expectOne('/api/tracks/track-1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });
});
