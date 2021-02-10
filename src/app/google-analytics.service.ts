import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

declare let gtag: Function;

@Injectable({
  providedIn: 'root',
})
export class GoogleAnalyticsService {
  constructor(private http: HttpClient) {}

  public eventEmitter(search: string) {
    this.http.get('https://ipapi.co/json/').subscribe((response) => {
      gtag('event', 'search', {
        search: search,
        date: new Date(),
        userLocation: response,
      });
    });
  }
}
