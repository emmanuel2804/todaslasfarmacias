import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  private clientKey: string;
  private token: string;

  constructor(private http: HttpClient) {}

  public autoLogin(): void {
    this.fetchClientKey();
  }

  private fetchClientKey(): void {
    this.http
      .get<{ clientKey: string }>('http://localhost:3000/api/user/app-logo')
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
      }>('http://localhost:3000/api/user/login', {
        clientKey: this.clientKey,
      })
      .subscribe((tken) => {
        this.token = tken.token;
      });
  }

  public getToken(): string {
    return this.token;
  }
}
