import { ViewportScroller } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-results',
  templateUrl: './results-page.component.html',
  styleUrls: ['./results-page.component.scss'],
})
export class ResultsPageComponent implements OnInit {
  public lowerToHigherPrice: boolean = true;
  public isLoading: boolean = false;
  public hasInapamDescount: boolean = true;
  public userInput: string = null;
  public userInputLocal: string = null;
  public products: [] = [];
  public noMore: boolean = false;
  private subsHandler: Subscription[] = [];

  @HostListener('window:scroll', ['$event']) onScroll(event) {
    // this.pageYoffset = window.pageYOffset;
  }

  constructor(
    private searchService: SearchService,
    private scroll: ViewportScroller
  ) {}

  // TODOS:
  // Add "odenar por" funcionality
  // Add key to dotenv

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
      this.searchService.getPosts().subscribe((products) => {
        this.isLoading = false;
        this.products = products;
        this.onSortProducts();
      })
    );
  }

  public onSearch(): void {
    if (this.userInputLocal) {
      this.userInput = this.userInputLocal;
      this.searchService.sendToScraper(this.userInputLocal);
      this.searchService.saveSearchData(this.userInputLocal);
    }
  }

  // public onSortProducts(incomingProducts?: []): void {
  //   this.lowerToHigherPrice = !this.lowerToHigherPrice;

  //   if (incomingProducts) {
  //     if (this.lowerToHigherPrice) {
  //       this.products.sort((a, b) => (a.price > b.price ? 1 : -1));
  //     } else {
  //       this.products.sort((a, b) => (a.price < b.price ? 1 : -1));
  //     }
  //   } else {
  //     if (this.products.length > 0) {
  //       if (this.lowerToHigherPrice) {
  //         this.products.sort((a, b) => (a.price > b.price ? 1 : -1));
  //       } else {
  //         this.products.sort((a, b) => (a.price < b.price ? 1 : -1));
  //       }
  //     }
  //   }
  // }

  private sortProducts(productsArray): [] {
    if (this.lowerToHigherPrice) {
      return productsArray.sort((a, b) => (a.price > b.price ? 1 : -1));
    } else {
      return productsArray.sort((a, b) => (a.price < b.price ? 1 : -1));
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
      case 'farmaciasguadalajara': {
        return '5% Descuento con inapam';
      }
      case 'farmaciasmatter': {
        return;
      }
      case 'farmaciasmultifarmacias': {
        return '0% Descuento con inapam';
      }
      case 'farmaciassanpablo': {
        return '0% Descuento con inapam';
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
      case 'farmaciasguadalajara': {
        return 'inapam -5%';
      }
      case 'farmaciasmatter': {
        return;
      }
      case 'farmaciasmultifarmacias': {
        return 'inapam 0%';
      }
      case 'farmaciassanpablo': {
        return 'inapam 0%';
      }
      case 'farmaciassams': {
        return 'inapam -7%';
      }
    }
  }

  public onPagination(): void {
    const paginatedProducts: [] = this.searchService.getPaginatedProducts(
      this.products.length
    );

    if (paginatedProducts.length > 0) {
      if (this.lowerToHigherPrice) {
        paginatedProducts.forEach((product) => this.products.push(product));
      } else {
        paginatedProducts.forEach((product) => this.products.unshift(product));
      }
    } else {
      this.noMore = true;
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
