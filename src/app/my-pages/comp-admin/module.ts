import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { CompAdminComponent } from './comp-admin.component';

@NgModule({
  declarations: [
    CompAdminComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: CompAdminComponent
      }
    ]),
  ]
})

export class Module { }
