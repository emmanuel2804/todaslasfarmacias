import { Component, OnInit } from "@angular/core";
import { NavigationEnd, Router } from "@angular/router";
import { AuthService } from "./auth/auth.service";
import { SearchService } from "./shared/search.service";
declare let gtag: Function;
declare let fbq: Function;

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private searchService: SearchService
  ) {}

  public ngOnInit(): void {
    this.authService.autoLogin();
    this.searchService.getUserLocation();

    this.router.events.subscribe((y: NavigationEnd) => {
      if (y instanceof NavigationEnd) {
        gtag("config", "AW-392105663", { page_path: y.url });
        fbq("track", "PageView");
      }
    });
  }
}
