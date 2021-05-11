import { Component, OnInit, Optional } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';
import { SEOService } from './seo.service';
import { SearchService } from './shared/search.service';
declare let gtag: Function;
declare let fbq: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private searchService: SearchService,
    private seoService: SEOService
  ) {}

  public ngOnInit(): void {
    this.authService.autoLogin();
    this.searchService.getUserLocation();
    // this.seoService.updateTitle('Esto es un titulo de prueba');
    // this.seoService.updateDescription(
    //   'Busque en más de 100000 medicamentos de diferentes farmacias para encontrar los precios más baratos'
    // );

    this.router.events.subscribe((y: NavigationEnd) => {
      if (y instanceof NavigationEnd) {
        gtag('config', 'G-31HE386NF9', { page_path: y.url });
        fbq('track', 'PageView');
      }
    });
  }
}
