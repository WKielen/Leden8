import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AreaComponent } from './widgets/area/area.component';
import { PieComponent } from './widgets/pie/pie.component';
import { HighchartsChartModule } from 'highcharts-angular';

@NgModule({
  declarations: [
    AreaComponent,
    PieComponent,
  ],
  imports: [
    CommonModule,
    HighchartsChartModule,
  ],
  exports: [
    AreaComponent,
    PieComponent,
  ]
})
export class SharedModule { }
