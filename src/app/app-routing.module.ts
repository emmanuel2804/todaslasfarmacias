import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomePageComponent } from './pages/home/home-page.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { ResultsWrapperComponent } from './pages/results-wrapper/results-wrapper.component';
import { ResultsPageComponent } from './pages/results/results-page.component';
import { TestPrintComponent } from './pages/test-print/test-print.component';

const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'results', component: ResultsWrapperComponent },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '/404',
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      relativeLinkResolution: 'legacy',
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
