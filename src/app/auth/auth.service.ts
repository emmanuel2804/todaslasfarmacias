import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class AuthService {
  private token: string;

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
      });
  }

  public getToken(): string {
    return this.token;
  }
}
