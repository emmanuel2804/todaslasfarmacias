import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-results',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
  public lowerToHigherPrice: boolean = true;
  public noMore: boolean = false;
  public isLoading: boolean = false;
  public hasInapamDescount: boolean = true;
  public userInput: string = null;
  public userInputLocal: string = null;
  public products: [] = [];
  private isFiltered: boolean = false;
  private selectedVendors: [] = [];
  private subsHandler: Subscription[] = [];

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    // this.pageYoffset = window.pageYOffset;
  }

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

  // TODOS
  // Resultados ceraca de ti al pedir locacion para coger la locacion del usuario y el ip

  constructor(
    private searchService: SearchService,
    private scroll: ViewportScroller
  ) {}

  public ngOnInit(): void {
    this.isLoading = this.searchService.getIsLoading();
    this.userInput = this.searchService.getUserInput();
    this.userInputLocal = this.userInput;

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
      })
    );
  }

  public onSearch(): void {
    if (this.userInputLocal) {
      this.userInput = this.userInputLocal;

      if (this.isFiltered) {
        this.searchService.sendToScraper(this.userInput, this.selectedVendors);
        return;
      }

      this.searchService.sendToScraper(this.userInputLocal);
    }
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

  private sortProducts(productsArray) {
    if (this.lowerToHigherPrice) {
      productsArray.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else {
      productsArray.sort((a, b) => (a.price < b.price ? 1 : -1));
    }
  }

  public onFilterProducts(vendorNames): void {
    this.isFiltered = true;
    this.selectedVendors = vendorNames.value;

    if (!this.userInput) return;

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

    let paginatedProducts = this.searchService.getPaginatedProducts(
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
    if (this.subsHandler.length > 0) {
      this.subsHandler.forEach((subscription) => subscription.unsubscribe());
    }
  }
}
