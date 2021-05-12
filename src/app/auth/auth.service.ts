import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable()
export class AuthService {
  private apiUrl = environment.apiUrl;
  private clientKey: string;
  private token: string;
  private token$ = new BehaviorSubject<string>('');

  constructor(private http: HttpClient) {}

  public autoLogin(): void {
    this.token$.asObservable().subscribe((token) => {
      if (!token) {
        console.log(token);
        this.fetchClientKey();
      }
    });
  }

  private fetchClientKey(): void {
    this.http
      .get<{ clientKey: string }>(this.apiUrl + 'api/user/app-logo')
      .subscribe((ckey) => {
        this.clientKey = ckey.clientKey;
        this.fetchToken();
      });
  }

  private fetchToken(): void {
    this.http
      .post<{
        token: string;
        expiresIn: { date: Date; milliseconds: number };
      }>(this.apiUrl + 'api/user/login', {
        clientKey: this.clientKey,
      })
      .subscribe((tken) => {
        this.token = tken.token;
        this.token$.next(this.token);
      });
  }

  public getToken(): Observable<string> {
    return this.token$.asObservable();
  }
}
