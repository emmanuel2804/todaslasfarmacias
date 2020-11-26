import { NgModule } from '@angular/core';

import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';

@NgModule({
  imports: [MatInputModule, MatButtonModule, MatIconModule],
  exports: [MatInputModule, MatButtonModule, MatIconModule],
})
export class MaterialModule {}
