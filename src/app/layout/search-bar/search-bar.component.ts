import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  templateUrl: './search-bar.component.html',
  styleUrls: ['./search-bar.component.scss'],
})
export class SearchBarComponent implements OnInit {
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
  public userInputLocal: string = null;

  constructor(private router: Router) {}

  ngOnInit(): void {}

  public onSearch(): void {
    this.router.navigate(['results'], {
      queryParams: {
        query: this.userInputLocal.toString().toLocaleLowerCase(),
      },
    });
  }
}
