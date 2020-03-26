import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaComponent } from './widgets/area/area.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    AreaComponent,
  ],
  imports: [
    CommonModule,
    HighchartsChartModule,
  ],
  exports: [
    AreaComponent,
  ]
})
export class SharedModule { }
