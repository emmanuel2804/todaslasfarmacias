import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, EMPTY } from 'rxjs';
import { Data } from './data.model';
import { Product } from './product.model';
import { AuthService } from '../auth/auth.service';

@Injectable()
export class SearchService {
  constructor(private http: HttpClient, private authServise: AuthService) {}
  private token: string;
  private mapKey: string;
  private userInput: string;
  private searchData: Data;
  private userLocation: {};
  private products: Product[] = [];
  private products$ = new Subject<Product[]>();
  private filteredProducts: [] = [];
  private isLoading = false;
  private isLoadingSuject = new Subject<boolean>();

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

  public getProducts(): Observable<Product[]> {
    return this.products$.asObservable();
  }

  public getProductsAmount(): number {
    return this.products.length;
  }

  public getFilteredProductsAmount(): number {
    return this.filteredProducts.length;
  }

  public getProductsAfterFilering(): void {
    const tempProducts: Product[] = [];

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

  public getPaginatedProducts(
    amountToSkip: number,
    filtered?: boolean
  ): Product[] {
    const paginatedProducts: Product[] = [];
    let productsToSort: Product[] = [];

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

  private shareLocationAccepted = (position: Position): void => {
    this.userLocation = {
      Location: {
        Cordinates: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      },
      ip: null,
    };

    this.http
      .get(
        `http://api.positionstack.com/v1/reverse?access_key=${this.mapKey}&query=` +
          position.coords.latitude +
          ',' +
          position.coords.longitude +
          '&output=json'
      )
      .subscribe((response: any) => {
        this.userLocation = { Location: response.data[0], ip: null };

        this.http.get('https://api.ipify.org/?format=json').subscribe(
          (ipRes: { ip: string }) => {
            this.userLocation = {
              Location: {
                geolocation: response.data[0],
                ip: ipRes.ip,
                mk: 'GEO',
              },
            };
          },
          (err) => EMPTY
        );
      });
  };

  private shareLocationRejected = (error: PositionError): void => {
    this.http.get('https://api.ipify.org/?format=json').subscribe(
      (ipRes: { ip: string }) => {
        this.http
          .get(
            `http://api.positionstack.com/v1/reverse?access_key=${this.mapKey}&query=${ipRes.ip}&output=json`
          )
          .subscribe((response: any) => {
            this.userLocation = {
              Location: {
                geolocation: response.data[0],
                ip: ipRes.ip,
                mk: 'IP',
              },
            };
          });
      },
      (err) => EMPTY
    );
  };

  public getUserLocation(): void {
    this.mapKey = this.authServise.getMapKey();

    navigator.geolocation.getCurrentPosition(
      this.shareLocationAccepted,
      this.shareLocationRejected
    );
  }

  public fetchProducts(userInput: string, vendorNames?: []): void {
    this.isLoading = true;
    this.isLoadingSuject.next(true);
    this.userInput = userInput;
    this.token = this.authServise.getToken();

    this.searchData = {
      userInput,
      userLocation: this.userLocation ? this.userLocation : null,
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

        const paginatedProducts: Product[] = [];
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
