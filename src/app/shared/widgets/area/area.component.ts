import { Component, OnInit, Input } from '@angular/core';
import * as Highcharts from 'highcharts';
import HC_exporting from 'highcharts/modules/exporting';


@Component({
  selector: 'app-widget-area',
  templateUrl: './area.component.html',
  styleUrls: ['./area.component.scss']
})
export class AreaComponent implements OnInit {

  chartOptions: {};
  @Input() data: any = [];

  Highcharts = Highcharts;

  constructor() { }

  ngOnInit() {
    this.chartOptions = {
      chart: {
        type: 'area'
      },
      title: {
        text: 'Ledenontwikkeling'
      },
      subtitle: {
        text: 'vanaf 2013'
      },


      xAxis: {
        categories: ['2013-01', '2013-02', '2014-01', '2014-02','2015-01', '2015-02', '2016-01'],
        tickmarkPlacement: 'on',
        title: {
          enabled: false
        }
      },
      yAxis: {
        title: {
          text: 'Leden'
        }
      },

      tooltip: {
        split: true,
        valueSuffix: ' leden'
      },
      credits: {
        enabled: false
      },
      exporting: {
        enabled: true,
      },
      series: this.data
    };

    HC_exporting(Highcharts);

    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

}
