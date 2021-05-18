import { DOCUMENT, ViewportScroller } from '@angular/common';
import {
  Component,
  HostListener,
  Inject,
  OnDestroy,
  OnInit,
  Optional,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GoogleAnalyticsService } from 'src/app/google-analytics.service';
import { MetadataService } from 'src/app/metadata.service';
import { Product } from 'src/app/shared/product.model';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-results',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit, OnDestroy {
  control = new FormControl();
  streets: string[] = [
    'Ivermectina',
    'Oseltamivir',
    'Dexametasona',
    'Azitromicina',
    'Redoxón',
    'Aderogyl',
    'Paracetamol',
  ];
  filteredStreets: Observable<string[]>;
  filters: string[];
  public lowerToHigherPrice = true;
  public noMore = false;
  public isLoading = false;
  public hasInapamDescount = true;
  public userInput: string = null;
  public userInputLocal: string = null;
  public products: Product[] = [];
  private isFiltered = false;
  private selectedVendors: [] = [];
  private subsHandler: Subscription[] = [];
  public alternativeProducts = false;

  pharmacies = new FormControl();
  pharmaciesList: string[] = [
    'Ahorro',
    'Chedraui',
    'Farmalisto',
    'Farmacias Gi',
    'Guadalajara',
    'Matter',
    'Multifarmacias',
    'San Pablo',
    'Sams',
  ];

  @HostListener('window:scroll', ['$event']) onScroll(event: any): void {
    // this.pageYoffset = window.pageYOffset;
  }

  constructor(
    private searchService: SearchService,
    private scroll: ViewportScroller,
    private route: ActivatedRoute,
    private router: Router,
    @Optional() private analyticService: GoogleAnalyticsService,
    @Optional() private metadataService: MetadataService
  ) {}

  public ngOnInit(): void {
    if (this.metadataService) {
      this.metadataService.updateMetadata({
        title: 'Todas las Farmacias',
        description:
          'Busque en más de 100000 medicamentos de diferentes farmacias para encontrar los precios más baratos',
      });
    }
    // this.searchService.fetchTopSearches();

    this.isLoading = this.searchService.getIsLoading();
    this.userInput = this.searchService.getUserInput();
    this.userInputLocal = this.userInput;

    this.subsHandler.push(
      this.route.queryParamMap.subscribe((params) => {
        this.userInputLocal = params.get('query');
        this.alternativeProducts = false;

        if (this.userInputLocal) {
          this.userInput = this.userInputLocal;

          if (this.analyticService)
            this.analyticService.eventEmitter(this.userInput.toString());

          if (this.isFiltered) {
            this.searchService.fetchProducts(
              this.userInput.toString().toLowerCase(),
              this.selectedVendors
            );
            return;
          }

          this.searchService.fetchProducts(
            this.userInput.toString().toLowerCase()
          );
          this.searchService.fetchTopSearches();
        }
      })
    );

    this.subsHandler.push(
      this.searchService.getIsLoadingSuject().subscribe((isLoading) => {
        this.isLoading = isLoading;
      })
    );

    this.subsHandler.push(
      this.searchService.getProducts().subscribe((products) => {
        this.isLoading = false;
        this.sortProducts(products);
        this.products = products;

        console.log(products[0]);
        console.log(products[0].price);
        console.log(products[0].image);
        if (this.metadataService && products.length > 0) {
          console.log('mandaron el metadata service');
          this.metadataService.updateMetadata({
            title: 'Todas las Farmacias',
            description: `Para este producto encuentre precios desde ${this.products[0].price}`,
            imageRelativeUrl: this.products[0].image,
            keywords: [this.userInputLocal],
          });
        }
        // if (products.length == 0) this.alternativeSearch();
      })
    );

    this.subsHandler.push(
      this.searchService.getTopSearches().subscribe((topSearches) => {
        this.isLoading = false;
        this.streets = topSearches.map((m) => m.name);
      })
    );

    this.subsHandler.push(
      this.searchService.getAlternativeProducts().subscribe((products) => {
        this.isLoading = false;
        this.sortProducts(products);
        this.products = products;
        this.alternativeProducts = true;
      })
    );

    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => {
        return this._filter(value);
      })
    );
  }

  private _filter(value: string): string[] {
    const filterValue = this._normalizeValue(value);
    return this.streets
      .filter((street) => this._normalizeValue(street).includes(filterValue))
      .slice(0, 5);
  }

  private _normalizeValue(value: string): string {
    try {
      return value.toLowerCase().replace(/\s/g, '');
    } catch (error) {
      return value;
    }
  }

  // private alternativeSearch() {
  //   console.log(`alternative search con ${this.userInput}`);
  //   this.searchService.fetchTopSearches().subscribe((result) => {
  //     this.streets = result.map((m) => m.name);

  //     let dist = 2 ** 32;
  //     this.streets.forEach((s) => {
  //       const newDist = this.searchService.Levenshtein(
  //         this.userInputLocal.toLowerCase(),
  //         s.toLowerCase()
  //       );
  //       console.log(`${this.userInputLocal}, ${s} = ${newDist}`);

  //       if (newDist < dist) {
  //         dist = newDist;
  //         this.userInput = s.toLowerCase();
  //       }
  //     });

  //     console.log(`Busqueda laternativa con ${this.userInput}`);
  //     console.log('Listado de comparacion:');
  //     console.log(this.streets);

  //     this.searchService.fetchAlternativeProducts(
  //       this.userInput.toString().toLowerCase()
  //     );
  //   });
  // }

  public onSearch(): void {
    // const query: string = this.route.snapshot.queryParamMap.get('query');
    // if (!query && this.userInputLocal)
    this.router.navigate(['results'], {
      queryParams: {
        query: this.userInputLocal.toString().toLocaleLowerCase(),
      },
    });

    // this.alternativeProducts = false;
    // if (this.userInputLocal) {
    //   this.userInput = this.userInputLocal;
    //   this.analyticService.eventEmitter(this.userInput.toString());
    //   if (this.isFiltered) {
    //     this.searchService.fetchProducts(
    //       this.userInput.toString().toLowerCase(),
    //       this.selectedVendors
    //     );
    //     return;
    //   }

    //   this.searchService.fetchProducts(this.userInput.toString().toLowerCase());
    //   this.searchService.fetchTopSearches();
    // }
  }

  public onSortProducts(incomingProducts?: []): void {
    this.lowerToHigherPrice = !this.lowerToHigherPrice;

    if (incomingProducts) {
      this.sortProducts(incomingProducts);
    } else {
      if (this.products.length > 0) {
        this.sortProducts(this.products);
      }
    }
  }

  private sortProducts(productsArray): void {
    if (this.lowerToHigherPrice) {
      productsArray.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else {
      productsArray.sort((a, b) => (a.price < b.price ? 1 : -1));
    }
  }

  public onFilterProducts(vendorNames): void {
    this.isFiltered = true;
    this.selectedVendors = vendorNames.value;

    if (!this.userInput) {
      return;
    }

    if (vendorNames.value.length === 0) {
      this.isFiltered = false;
      this.selectedVendors = [];
      this.searchService.getProductsAfterFilering();
    }

    if (vendorNames.value.length === 1) {
      this.searchService.filterProducts(vendorNames.value);
    }

    if (this.isFiltered && vendorNames.value.length > 1) {
      this.searchService.filterProducts(vendorNames.value, true);
    }

    if (this.searchService.getFilteredProductsAmount() > this.products.length) {
      this.noMore = false;
    }
  }

  public vendorLogoCheck(productVendor: string): string {
    switch (productVendor) {
      case 'farmaciasahorro': {
        return '../../../assets/images/logos-farmacias/farmaciasahorro.png';
      }
      case 'farmaciaschedraui': {
        return '../../../assets/images/logos-farmacias/farmaciaschedraui.png';
      }
      case 'farmaciasfarmalisto': {
        return '../../../assets/images/logos-farmacias/farmaciasfarmalisto.png';
      }
      case 'farmaciasgi': {
        return '../../../assets/images/logos-farmacias/farmaciasgi.png';
      }
      case 'farmaciasguadalajara': {
        return '../../../assets/images/logos-farmacias/farmaciasguadalajara.png';
      }
      case 'farmaciasmatter': {
        return '../../../assets/images/logos-farmacias/farmaciasmatter.png';
      }
      case 'farmaciasmultifarmacias': {
        return '../../../assets/images/logos-farmacias/farmaciasmultifarmacias.png';
      }
      case 'farmaciassanpablo': {
        return '../../../assets/images/logos-farmacias/farmaciassanpablo.png';
      }
      case 'farmaciassams': {
        return '../../../assets/images/logos-farmacias/farmaciassams.png';
      }
    }
  }

  public discountCheck(productVendor: string): string {
    switch (productVendor) {
      case 'farmaciasahorro': {
        return '10% Descuento con inapam';
      }
      case 'farmaciaschedraui': {
        return '5% Descuento con inapam';
      }
      case 'farmaciasfarmalisto': {
        return; // '0% Descuento con inapam';
      }
      case 'farmaciasgi': {
        return; // '0% Descuento con inapam';
      }
      case 'farmaciasguadalajara': {
        return '5% Descuento con inapam';
      }
      case 'farmaciasmatter': {
        return;
      }
      case 'farmaciasmultifarmacias': {
        return; // '0% Descuento con inapam';
      }
      case 'farmaciassanpablo': {
        return; // '0% Descuento con inapam';
      }
      case 'farmaciassams': {
        return '7% Descuento con inapam';
      }
    }
  }

  public discountCheckXs(productVendor: string): string {
    switch (productVendor) {
      case 'farmaciasahorro': {
        return 'inapam -10%';
      }
      case 'farmaciaschedraui': {
        return 'inapam -5%';
      }
      case 'farmaciasfarmalisto': {
        return; // 'inapam -0%';
      }
      case 'farmaciasgi': {
        return; // 'inapam -0%';
      }
      case 'farmaciasguadalajara': {
        return 'inapam -5%';
      }
      case 'farmaciasmatter': {
        return;
      }
      case 'farmaciasmultifarmacias': {
        return; // 'inapam 0%';
      }
      case 'farmaciassanpablo': {
        return; // 'inapam 0%';
      }
      case 'farmaciassams': {
        return 'inapam -7%';
      }
    }
  }

  public async onPagination(): Promise<void> {
    if (
      !this.isFiltered &&
      this.products.length === this.searchService.getProductsAmount()
    ) {
      this.noMore = true;
      return;
    }
    if (
      this.isFiltered &&
      this.products.length === this.searchService.getFilteredProductsAmount()
    ) {
      this.noMore = true;
      return;
    }

    const paginatedProducts = this.searchService.getPaginatedProducts(
      this.products.length,
      this.isFiltered
    );

    if (paginatedProducts.length > 0) {
      if (this.lowerToHigherPrice) {
        await paginatedProducts.forEach((product) => {
          setTimeout(() => {
            this.products.push(product);
          }, 500);
        });
      } else {
        paginatedProducts.forEach((product) => this.products.unshift(product));
        this.scrollToTop();
      }
    }
  }

  public scrollToTop(): void {
    this.scroll.scrollToPosition([0, 0]);
  }

  public ngOnDestroy(): void {
    this.isLoading = false;

    if (this.subsHandler.length > 0) {
      this.subsHandler.forEach((subscription) => subscription.unsubscribe());
    }
  }
}
