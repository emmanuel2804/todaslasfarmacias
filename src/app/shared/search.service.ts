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
  private filteredProducts: [] = [];
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

  public getProducts(): Observable<[]> {
    return this.products$.asObservable();
  }

  public getProductsAmount(): number {
    return this.products.length;
  }

  public getFilteredProductsAmount(): number {
    return this.filteredProducts.length;
  }

  public getPaginatedProducts(amountToSkip: number, filtered?: boolean): [] {
    const paginatedProducts: [] = [];
    let productsToSort: [] = [];

    if (filtered) {
      productsToSort = this.filteredProducts;
    } else {
      productsToSort = this.products;
    }

    let counter = amountToSkip;
    while (counter < amountToSkip + 24 && counter < productsToSort.length) {
      paginatedProducts.push(productsToSort[counter]);
      counter++;
    }
    console.log('paginated products: ' + paginatedProducts.length);
    return paginatedProducts;
  }

  public filterProducts(vendorNames: any[]) {
    console.log('filterProducts fired!');
    const tempProducts = [];

    if (vendorNames.length === 1) {
      console.log('vendorNames.length === 1');
      console.log(this.products.length);
      this.products.forEach((product: any) => {
        if (product.vendor === this.getVendorCode(vendorNames[0])) {
          tempProducts.push(product);
        }
      });
    } else if (vendorNames.length > 1) {
      vendorNames.forEach((vendorNames: string) => {
        this.products.forEach((product: any) => {
          if (product.vendor === this.getVendorCode(vendorNames)) {
            tempProducts.push(product);
          }
        });
      });
    }

    this.filteredProducts = tempProducts as [];
    console.log(
      'total amount filtered products: ' + this.filteredProducts.length
    );

    if (this.filteredProducts.length <= 24) {
      this.products$.next([...this.filteredProducts]);
    } else {
      const paginatedFilteredProducts = [];

      let counter = 0;
      this.filteredProducts.forEach((product) => {
        console.log(product);
        paginatedFilteredProducts.push(product);
        counter++;
      });

      console.log('filtered paginated products: ' + paginatedFilteredProducts);

      this.products$.next([...(paginatedFilteredProducts as [])]);
    }
  }

  private sortProducts(productsArray, sortLowToHigh?: boolean) {
    if (sortLowToHigh) {
      productsArray.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else {
      productsArray.sort((a, b) => (a.price < b.price ? 1 : -1));
    }
  }

  private getVendorCode(pharmacyName: string): string {
    switch (pharmacyName) {
      case 'Ahorro': {
        return 'farmaciasahorro';
      }
      case 'Chedraui': {
        return 'farmaciaschedraui';
      }
      case 'Farmalisto': {
        return 'farmaciasfarmalisto';
      }
      case 'Farmacias Gi': {
        return 'farmaciasgi';
      }
      case 'Guadalajara': {
        return 'farmaciasguadalajara';
      }
      case 'Matter': {
        return 'farmaciasmatter';
      }
      case 'Multifarmacias': {
        return 'farmaciasmultifarmacias';
      }
      case 'San Pablo': {
        return 'farmaciassanpablo';
      }
      case 'Sams': {
        return 'farmaciassams';
      }
    }
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

        console.log('total ammount of products: ' + response.products.length);

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
