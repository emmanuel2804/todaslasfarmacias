import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, EMPTY } from 'rxjs';
import { Data } from './data.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SearchService {
  private token: string = null;
  private searchData: Data = null;
  private products: [] = [];
  private products$ = new Subject<[]>();
  private filteredProducts: [] = [];
  private isLoading = false;
  private isLoadingSuject = new Subject<boolean>();
  private userInput: string = null;
  private userLocation: {} = null;
  private userIp: {} = null;

  constructor(private http: HttpClient, private authServise: AuthService) {}

  public getUserInput(): string {
    if (this.userInput) {
      return this.userInput;
    }
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

  public getProductsAfterFilering(): void {
    const tempProducts: [] = [];

    if (this.products.length <= 24) {
      this.products$.next([...this.products]);
      return;
    }
    let counter = 0;
    while (tempProducts.length <= 24) {
      tempProducts.push(this.products[counter]);
      counter++;
    }
    this.products$.next([...tempProducts]);
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
    return paginatedProducts;
  }

  public filterProducts(vendorNames: any[], more: boolean = false): void {
    const tempProducts = [];

    if (vendorNames.length === 1) {
      this.products.forEach((product: any) => {
        if (product.vendor === this.getVendorCode(vendorNames[0])) {
          tempProducts.push(product);
        }
      });
    } else if (vendorNames.length > 1) {
      vendorNames.forEach((vendorName: string) => {
        this.products.forEach((product: any) => {
          if (product.vendor === this.getVendorCode(vendorName)) {
            tempProducts.push(product);
          }
        });
      });
    }
    this.filteredProducts = this.sortProducts(tempProducts, true);

    if (this.filteredProducts.length <= 24) {
      this.products$.next([...this.filteredProducts]);
    } else {
      const paginatedFilteredProducts = [];
      let amountToReturn = 24;

      if (more) {
        amountToReturn = 50;
      }

      let counter = 0;
      while (counter < amountToReturn) {
        paginatedFilteredProducts.push(this.filteredProducts[counter]);
        counter++;
      }
      this.products$.next([...(paginatedFilteredProducts as [])]);
    }
  }

  private sortProducts(productsArray, sortLowToHigh: boolean): [] {
    if (sortLowToHigh) {
      productsArray.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else {
      productsArray.sort((a, b) => (a.price < b.price ? 1 : -1));
    }

    return productsArray;
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

  public getUserLocation(): void {
    navigator.geolocation.getCurrentPosition((position) => {
      this.userLocation = {
        Cordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };

      this.http
        .get(
          'http://api.positionstack.com/v1/reverse?access_key=a312128049ad32653aa031934c59a918&query=' +
            position.coords.latitude +
            ',' +
            position.coords.longitude +
            '&output=json'
        )
        .subscribe((response: any) => {
          this.userLocation = { Location: response.data[0] };

          this.http.get('https://api.ipify.org/?format=json').subscribe(
            (ipResponse: { ip: string }) => {
              this.userLocation = {
                Location: {
                  geolocation: response.data[0],
                  ip: ipResponse.ip,
                },
              };
            },
            (err) => EMPTY
          );
        });
    });

    this.http.get('https://api.ipify.org/?format=json').subscribe(
      (response: { ip: string }) => {
        this.userIp = {
          ip: response.ip,
        };
      },
      (err) => EMPTY
    );
  }

  public search(userInput: string, vendorNames?: []): void {
    this.isLoading = true;
    this.isLoadingSuject.next(true);
    this.userInput = userInput;
    this.token = this.authServise.getToken();

    this.searchData = {
      userInput,
      userLocation: this.userLocation != null ? this.userLocation : this.userIp,
      date: new Date(),
    };

    this.http
      .post<{ products: [] }>(
        'http://localhost:3000/api/search',
        { searchData: this.searchData },
        {
          headers: { Authorization: 'Bearer ' + this.token },
        }
      )
      .subscribe((response) => {
        this.isLoadingSuject.next(false);
        this.products = response.products;

        if (vendorNames && vendorNames.length > 0) {
          this.filterProducts(vendorNames);
          return;
        }

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
