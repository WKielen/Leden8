import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TestComponent } from './test.component';
import { A2hsComponent } from 'src/app/shared/components/a2hs/a2hs.component';
import { CustomMaterialModule } from 'src/app/material.module';


@NgModule({
  declarations: [
    TestComponent,
    A2hsComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TestComponent
      }
    ]),
    CommonModule,
    CustomMaterialModule,
  ]
})

export class Module { }
