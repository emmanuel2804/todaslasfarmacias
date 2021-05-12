import {
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Optional,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { GoogleAnalyticsService } from 'src/app/google-analytics.service';
import { MetadataService } from 'src/app/metadata.service';
import { SearchService } from 'src/app/shared/search.service';

@Component({
  selector: 'app-home-page',
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.scss'],
})
export class HomePageComponent implements OnInit, AfterViewInit, OnDestroy {
  control = new FormControl();
  private subsHandler: Subscription[] = [];
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
    private route: ActivatedRoute,
    private analyticService: GoogleAnalyticsService,
    @Optional() private metadataService: MetadataService
  ) {}

  ngOnDestroy(): void {
    if (this.subsHandler.length > 0) {
      this.subsHandler.forEach((subscription) => subscription.unsubscribe());
    }
  }

  ngAfterViewInit(): void {
    const query: string = this.route.snapshot.queryParamMap.get('query');
    if (query) {
      this.userInput = query;
      this.onSearch();
    }
  }

  public ngOnInit(): void {
    if (this.metadataService) {
      console.log('mandaron el metadata service');
      this.metadataService.updateMetadata({
        title: 'Todas las Farmacias',
        description:
          'Busque en más de 100000 medicamentos de diferentes farmacias para encontrar los precios más baratos',
      });
    }

    this.searchService.fetchTopSearches();

    this.filteredStreets = this.control.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );

    this.subsHandler.push(
      this.searchService.getTopSearches().subscribe((topSearches) => {
        this.streets = topSearches.map((m) => m.name);
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

  public onSearch(): void {
    if (this.userInput) {
      this.analyticService.eventEmitter(this.userInput.toString());
      this.searchService.fetchProducts(
        this.userInput.toString().toLocaleLowerCase()
      );
      this.router.navigate(['results'], {
        queryParams: { query: this.userInput.toString().toLocaleLowerCase() },
      });
    }
  }
}
