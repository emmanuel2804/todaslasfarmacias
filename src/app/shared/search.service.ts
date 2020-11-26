import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Data } from './data.model';
import { AuthService } from '../auth/auth.service';
import { Observable, Subject } from 'rxjs';

@Injectable()
export class SearchService {
  private token: string;
  private searchData: Data;
  private products: [] = [];
  private products$ = new Subject<[]>();
  private isLoading: boolean = false;
  private isLoadingSuject = new Subject<boolean>();
  private userInput: string = null;

  constructor(private http: HttpClient, private authServise: AuthService) {}

  public getUserInput(): string {
    if (this.userInput) return this.userInput;
    return null;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public getIsLoadingSuject(): Observable<boolean> {
    return this.isLoadingSuject.asObservable();
  }

  public getPosts(): Observable<[]> {
    return this.products$.asObservable();
  }

  public getPaginatedProducts(amountToSkip: number): [] {
    const paginatedProducts: [] = [];

    let counter = amountToSkip;
    while (counter < amountToSkip + 24 && counter < this.products.length) {
      paginatedProducts.push(this.products[counter]);
      counter++;
    }
    return paginatedProducts;
  }

  public saveSearchData(userInput: string): void {
    this.searchData = {
      userInput: userInput,
      date: new Date(),
    };
    this.token = this.authServise.getToken();

    this.http
      .post(
        'http://localhost:3000/api/search',
        { searchData: this.searchData },
        {
          headers: { Authorization: 'Bearer ' + this.token },
        }
      )
      .subscribe((response) => {
        console.log(response);
      });
  }

  public sendToScraper(userInput: string): void {
    this.isLoading = true;
    this.isLoadingSuject.next(true);

    this.userInput = userInput;
    this.token = this.authServise.getToken();

    this.http
      .post<{ products: [] }>(
        'http://localhost:3000/api/search/scraper',
        { userInput: userInput },
        {
          headers: { Authorization: 'Bearer ' + this.token },
        }
      )
      .subscribe((response) => {
        this.isLoadingSuject.next(false);
        this.products = response.products;

        const paginatedProducts: [] = [];

        if (this.products.length > 24) {
          let counter = 0;
          while (counter < 24) {
            paginatedProducts.push(this.products[counter]);
            counter++;
          }

          this.products$.next(paginatedProducts);
        } else {
          this.products$.next(this.products);
        }
      });
  }
}
