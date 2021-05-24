import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Data, IMedicine } from './data.model';
import { Product } from './product.model';
import { AuthService } from '../auth/auth.service';
import { environment } from '../../environments/environment';

@Injectable()
export class SearchService {
  constructor(private http: HttpClient, private authServise: AuthService) {}
  private userInput: string;
  private searchData: Data;
  private userLocation: any;
  private products: Product[] = [];
  private products$ = new Subject<Product[]>();
  private topSearches: IMedicine[] = [];
  private topSearches$ = new Subject<IMedicine[]>();
  private alternativeProducts$ = new Subject<Product[]>();
  private filteredProducts: [] = [];
  private isLoading = false;
  private isLoadingSuject = new Subject<boolean>();
  private apiUrl = environment.apiUrl;

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

  public getTopSearches(): Observable<IMedicine[]> {
    return this.topSearches$.asObservable();
  }

  public getAlternativeProducts(): Observable<Product[]> {
    return this.alternativeProducts$.asObservable();
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
        if (product.verndor === this.getVendorCode(vendorNames[0])) {
          tempProducts.push(product);
        }
      });
    } else if (vendorNames.length > 1) {
      vendorNames.forEach((vendorName: string) => {
        this.products.forEach((product: any) => {
          if (product.verndor === this.getVendorCode(vendorName)) {
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
    this.http.get('https://ipapi.co/json/').subscribe(
      (response) => {
        this.userLocation = {
          Location: response,
        };
      },
      (err) => {
        this.getUserLocationIfAddBlock();
      }
    );
  }

  private getUserLocationIfAddBlock(): void {
    navigator.geolocation.getCurrentPosition((position) => {
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
          'http://api.positionstack.com/v1/reverse?access_key=a312128049ad32653aa031934c59a918&query=' +
            position.coords.latitude +
            ',' +
            position.coords.longitude +
            '&output=json'
        )
        .subscribe((response: any) => {
          this.userLocation = { Location: response.data[0], ip: null };
        });
    });
  }

  // public fetchProducts(userInput: string, vendorNames?: []): void {
  //   this.isLoading = true;
  //   this.isLoadingSuject.next(true);
  //   this.userInput = userInput;
  //   this.token = this.authServise.getToken();

  //   this.searchData = {
  //     userInput,
  //     userLocation: this.userLocation ? this.userLocation : null,
  //     date: new Date(),
  //   };

  //   this.http
  //     .post<{ products: [] }>(
  //       'http://localhost:3000/api/search',
  //       { searchData: this.searchData },
  //       {
  //         headers: { Authorization: 'Bearer ' + this.token },
  //       }
  //     )
  //     .subscribe((response) => {
  //       this.isLoadingSuject.next(false);
  //       this.products = response.products;

  //       if (vendorNames && vendorNames.length > 0) {
  //         this.filterProducts(vendorNames);
  //         return;
  //       }

  //       const paginatedProducts: Product[] = [];
  //       if (this.products.length > 24) {
  //         let counter = 0;
  //         while (counter < 24) {
  //           paginatedProducts.push(this.products[counter]);
  //           counter++;
  //         }
  //         this.products$.next(paginatedProducts);
  //       } else {
  //         this.products$.next(this.products);
  //       }
  //     });
  // }

  public fetchTopSearches(): void {
    this.isLoading = true;
    this.isLoadingSuject.next(true);

    this.authServise.getToken().subscribe((token) => {
      if (!token) return;

      this.http
        .get<IMedicine[]>(this.apiUrl + 'api/search/top-searches', {
          headers: { Authorization: 'Bearer ' + token },
        })
        .subscribe((topSearches) => {
          this.topSearches = topSearches;
          this.topSearches$.next(this.topSearches);
          this.isLoadingSuject.next(false);
        });
    });
  }

  public fetchProducts(userInput: string, vendorNames?: []): void {
    this.authServise.autoLogin();
    this.products = [];
    this.products$.next([]);
    this.isLoading = true;
    this.isLoadingSuject.next(true);
    this.userInput = userInput;
    this.authServise.getToken().subscribe((token) => {
      if (!token) return;

      this.searchData = {
        userInput,
        userLocation: this.userLocation ? this.userLocation : null,
        date: new Date(),
      };

      this.http
        .post<any>(
          this.apiUrl + 'api/search/products/' + userInput,
          { searchData: this.searchData },
          {
            headers: { Authorization: 'Bearer ' + token },
          }
        )
        .subscribe(
          (response) => {
            this.isLoadingSuject.next(false);
            this.products = response;

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
          },
          (error) => {
            this.isLoadingSuject.next(false);
            if (error.status === 404) {
              this.http
                .post<any>(
                  this.apiUrl + 'api/search/top-searches/' + userInput,
                  { searchData: this.searchData },
                  {
                    headers: { Authorization: 'Bearer ' + token },
                  }
                )
                .subscribe((result) => {
                  this.products$.next([]);
                });
            }
          }
        );
    });
  }

  public fetchAlternativeProducts(userInput: string, vendorNames?: []): void {
    this.isLoading = true;
    this.isLoadingSuject.next(true);
    this.userInput = userInput;

    this.authServise.getToken().subscribe((token) => {
      this.http
        .post<any>(
          this.apiUrl + 'api/search/products/' + userInput,
          { searchData: this.searchData },
          {
            headers: { Authorization: 'Bearer ' + token },
          }
        )
        .subscribe((response) => {
          this.isLoadingSuject.next(false);
          this.products = response;

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
            this.alternativeProducts$.next(paginatedProducts);
          } else {
            this.alternativeProducts$.next(this.products);
          }
        });
    });
  }

  // Levenshtein(String, String) -> Integer
  public Levenshtein(a: string, b: string): number {
    var n = a.length;
    var m = b.length;

    // matriz de cambios mínimos
    var d = [];

    // si una de las dos está vacía, la distancia
    // es insertar todas las otras
    if (n == 0) return m;
    if (m == 0) return n;

    // inicializamos el peor caso (insertar todas)
    for (var i = 0; i <= n; i++) (d[i] = [])[0] = i;
    for (var j = 0; j <= m; j++) d[0][j] = j;

    // cada elemento de la matriz será la transición con menor coste
    for (var i = 1, I = 0; i <= n; i++, I++)
      for (var j = 1, J = 0; j <= m; j++, J++)
        if (b[J] == a[I]) d[i][j] = d[I][J];
        else d[i][j] = Math.min(d[I][j], d[i][J], d[I][J]) + 1;

    // el menor número de operaciones
    return d[n][m];
  }
}
