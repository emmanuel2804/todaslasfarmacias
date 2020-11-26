import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
  public userInput: string;

  constructor(private searchService: SearchService, private router: Router) {}

  public ngOnInit(): void {}

  public onSearch(): void {
    if (this.userInput) {
      this.searchService.sendToScraper(this.userInput.toString());
      this.router.navigate(['results-page']);
    }
  }
}
