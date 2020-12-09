import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';

import { AuthService } from './auth/auth.service';
import { SearchService } from './shared/search.service';

import { AppComponent } from './app.component';
import { HomePageComponent } from './pages/home/home-page.component';
import { ResultsPageComponent } from './pages/results/results-page.component';

@NgModule({
  declarations: [AppComponent, HomePageComponent, ResultsPageComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MaterialModule,
    HttpClientModule,
  ],
  providers: [AuthService, SearchService],
  bootstrap: [AppComponent],
})
export class AppModule {}
