import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  private token: string;
  private tokenTimer: any;

  constructor(private http: HttpClient) {}

  public autoLogin(): void {
    this.http
      .post<{ token: string; expiresIn: { date: Date; milliseconds: number } }>(
        'http://localhost:3000/api/user/login',
        {
          clientKey:
            'kndf8y!"·$%%·&045vb4$(&%7dghfu23f4&$%·e934rg)(&&hf3fhsñwmgrauf5%&784=(%5245',
        }
      )
      .subscribe((response) => {
        this.token = response.token;

        // if (this.token) {
        //   this.setAuthTimer(response.expiresIn.milliseconds);
        //   this.saveAuthData(this.token, response.expiresIn.date);
        // }
      });
  }

  public getToken(): string {
    return this.token;
  }

  // Saves token to the local storage
  private saveAuthData(token: string, date: any): void {
    localStorage.setItem('tlfToken', token);
    localStorage.setItem('tlfExpirationDate', date);
  }

  // Gets token from the local storage
  private getAuthData(): { token: string; expirationDate: Date } {
    const token = localStorage.getItem('tlfToken');
    const expirationDate = localStorage.getItem('tlfExpirationDate');

    if (!token || !expirationDate) return;

    return {
      token: token,
      expirationDate: new Date(expirationDate),
    };
  }

  // Sets a timer to the time left for the token to expire
  // if expired requests a new one (by login the user)
  private setAuthTimer(duration: number): void {
    this.tokenTimer = setTimeout(() => {
      // logs back the user once the time has run out (token has expired)
      this.autoLogin();
    }, duration);
  }
}
