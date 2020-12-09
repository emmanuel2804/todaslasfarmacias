import { Component, OnInit } from '@angular/core';
import { AuthService } from './auth/auth.service';
import { SearchService } from './shared/search.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private searchService: SearchService
  ) {}

  public ngOnInit(): void {
    this.authService.autoLogin();
    this.searchService.getUserLocation();
  }
}
