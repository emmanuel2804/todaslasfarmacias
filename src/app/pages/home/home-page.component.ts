import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GoogleAnalyticsService } from 'src/app/google-analytics.service';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit {
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

  public userInput: string;

  constructor(
    private searchService: SearchService,
    private router: Router,
    private analyticService: GoogleAnalyticsService
  ) {}

  public ngOnInit(): void {
    const topSearches = this.searchService.fetchTopSearches();
    if (topSearches !== null) {
      topSearches.subscribe((result) => {
        this.streets = result.map((m) => m.name);
      });
    }

    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
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

  public onSearch(): void {
    if (this.userInput) {
      this.analyticService.eventEmitter(this.userInput.toString());
      this.searchService.fetchProducts(
        this.userInput.toString().toLocaleLowerCase()
      );
      this.router.navigate(['results']);
    }
  }
}
