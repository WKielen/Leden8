import { Component, OnInit } from '@angular/core';
import { LedenItem, LedenService } from 'src/app/services/leden.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { DateRoutines } from 'src/app/services/leden.service';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { A2hsService } from 'src/app/services/a2hs.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent extends ParentComponent implements OnInit {

  private todayMoment = moment();
  private todayDate = moment().toDate();
  private ledenDataArray: LedenItem[] = [];

  // input voor de linechart
  public bigChart = null;
  private referenceDateArray: Date[] = [];
  private xAxisValueArray: string[] = [];

  // input variables for voor pie charts
  public pieChart1 = null;
  public pieChart2 = null;
  public pieChart3 = null;

  private countMemberArray: number[] = [];
  private countJuniorMemberArray: number[] = [];
  private countSeniorMemberArray: number[] = [];;

  private countSenMale: number = 0;
  private countSenFemale: number = 0;
  private countJunMale: number = 0;
  private countJunFemale: number = 0;

  private countAge_0_10: number = 0;
  private countAge_11_12: number = 0;
  private countAge_13_14: number = 0;
  private countAge_15_17: number = 0;
  private countAge_17_25: number = 0;
  private countAge_25_35: number = 0;
  private countAge_35_65: number = 0;
  private countAge_65_100: number = 0;

  private countMembershipLengt_1: number = 0;
  private countMembershipLengt_2: number = 0;
  private countMembershipLengt_3: number = 0;
  private countMembershipLengt_5: number = 0;
  private countMembershipLengt_7: number = 0;
  private countMembershipLengt_10: number = 0;
  private countMembershipLengt_20: number = 0;
  private countMembershipLengt_30: number = 0;


  constructor(
    protected snackBar: MatSnackBar,
    public a2hs: A2hsService,
    public ledenService: LedenService) {
      super(snackBar)  }

  ngOnInit() {

    let sub = this.ledenService.getAll$()
      .subscribe((data: Array<LedenItem>) => {
        this.ledenDataArray = data;
        this.FillTheCounters();
        this.bigChart = this.GetDataForLineChart();
        this.pieChart1 = this.GetDataForMaleFemalePie();
        this.pieChart2 = this.GetDataForAgePie();
        this.pieChart3 = this.GetDataForMemberschipPie();;
      });

      this.registerSubscription(sub);
  }

  FillTheCounters(): void {
    this.CreateArrayWithReferenceDates();   // fills referenceDateArray and xAxisValueArray
    this.referenceDateArray.forEach(referenceDate => {
      let countLeden = 0;
      let countJuniorLeden = 0;
      let countSeniorLeden = 0;
      this.ledenDataArray.forEach(lid => {
        let lidvanaf: Date = new Date(lid.LidVanaf);
        let lidtot: Date = new Date(lid.LidTot);

        if (lidvanaf < referenceDate && (referenceDate < lidtot || lid.Opgezegd == '0')) {
          countLeden += 1;

          let age = DateRoutines.AgeRel(lid.GeboorteDatum, referenceDate);
          if (age <= 17) {
            countJuniorLeden += 1;
          } else {
            countSeniorLeden += 1;
          }
        }
      });
      this.countMemberArray.push(countLeden);
      this.countJuniorMemberArray.push(countJuniorLeden);
      this.countSeniorMemberArray.push(countSeniorLeden);
    });

    this.ledenDataArray.forEach(lid => {
      let lidtot: Date = new Date(lid.LidTot);

      if (this.todayDate < lidtot || lid.Opgezegd == '0') {
        let age = DateRoutines.AgeRel(lid.GeboorteDatum, this.todayDate);
        let membershipYears = this.todayMoment.get('years') - moment(lid.LidVanaf).get('years');

        if (age <= 17) {
          if (lid.Geslacht == 'M') {
            this.countJunMale += 1;
          } else {
            this.countJunFemale += 1;
          }
        } else {
          if (lid.Geslacht == 'M') {
            this.countSenMale += 1;
          } else {
            this.countSenFemale += 1;
          }
        }

        switch (true) {
          case age <= 10: {
            this.countAge_0_10 += 1;
            break;
          }
          case age <= 12: {
            this.countAge_11_12 += 1;
            break;
          }
          case age <= 14: {
            this.countAge_13_14 += 1;
            break;
          }
          case age <= 17: {
            this.countAge_15_17 += 1;
            break;
          }
          case age <= 25: {
            this.countAge_17_25 += 1;
            break;
          }
          case age <= 35: {
            this.countAge_25_35 += 1;
            break;
          }
          case age <= 65: {
            this.countAge_35_65 += 1;
            break;
          }
          default: {
            this.countAge_65_100 += 1;
            break;
          }
        }

        switch (true) {
          case membershipYears <= 1: {
            this.countMembershipLengt_1 += 1;
            break;
          }
          case membershipYears <= 2: {
            this.countMembershipLengt_2  += 1;
            break;
          }
          case membershipYears <= 3: {
            this.countMembershipLengt_3 += 1;
            break;
          }
          case membershipYears <= 5: {
            this.countMembershipLengt_5 += 1;
            break;
          }
          case membershipYears <= 7: {
            this.countMembershipLengt_7 += 1;
            break;
          }
          case membershipYears <= 10: {
            this.countMembershipLengt_10 += 1;
            break;
          }
          case membershipYears <= 20: {
            this.countMembershipLengt_20 += 1;
            break;
          }
          default: {
            this.countMembershipLengt_30 += 1;
            break;
          }
        }
      }
    });

  }


  GetDataForLineChart(): GraphData {
    let lineData = new GraphData();
    lineData.xAxis = this.xAxisValueArray;
    lineData.Title = 'Ledenontwikkeling';
    lineData.SubTitle = 'vanaf 2013';
    lineData.yAxisTitle = 'Aantal Leden';
    lineData.LegendaSuffix = ' leden';

    lineData.Data = [{
      name: 'Totaal',
      data: this.countMemberArray
    }, {
      name: 'Volwassenen',
      data: this.countSeniorMemberArray
    }, {
      name: 'Jeugd',
      data: this.countJuniorMemberArray
    }
    ];

    return lineData;
  }

  GetDataForMaleFemalePie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Vrouw / Man verdeling';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';


    pieData.Data = [{
      name: 'Vrouw',
      y: this.countSenFemale,
      sliced: true,
    }, {
      name: 'Man',
      y: this.countSenMale
    }, {
      name: 'Jongen',
      y: this.countJunMale
    }, {
      name: 'Meisje',
      y: this.countJunFemale,
      sliced: true

    }];

    return pieData;
  }


  GetDataForAgePie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Leeftijd verdeling';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';
    pieData.Data = [{
      name: '< 10 jaar',
      y: this.countAge_0_10,
    }, {
      name: '11-12 jaar',
      y: this.countAge_11_12
    }, {
      name: '13-14 jaar',
      y: this.countAge_13_14
    }, {
      name: '15-17 jaar',
      y: this.countAge_15_17,
    }, {
      name: '18-25 jaar',
      y: this.countAge_17_25,
    }, {
      name: '26-35 jaar',
      y: this.countAge_25_35
    }, {
      name: '36-65 jaar',
      y: this.countAge_35_65
    }, {
      name: '> 65 jaar',
      y: this.countAge_65_100,
    }];

    return pieData;
  }


  GetDataForMemberschipPie(): GraphData {
    let pieData = new GraphData();
    pieData.Title = 'Lengte lidmaatschap';
    pieData.yAxisTitle = 'leden';
    pieData.LabelFormat = '<b>{point.name}</b>: {point.percentage:.1f} %';
    pieData.TooltipFormat = '{point.y} {series.name}: <b>{point.percentage:.1f}%</b>';
    pieData.Data = [{
      name: '< 1 jaar',
      y: this.countMembershipLengt_1,
    }, {
      name: '2 jaar',
      y: this.countMembershipLengt_2
    }, {
      name: '3 jaar',
      y: this.countMembershipLengt_3
    }, {
      name: '4-5 jaar',
      y: this.countMembershipLengt_5,
    }, {
      name: '6-7 jaar',
      y: this.countMembershipLengt_7,
    }, {
      name: '8-10 jaar',
      y: this.countMembershipLengt_10
    }, {
      name: '11-20 jaar',
      y: this.countMembershipLengt_20
    }, {
      name: '> 20 jaar',
      y: this.countMembershipLengt_30,
    }];

    return pieData;
  }


  CreateArrayWithReferenceDates(): void {
    let mydate = moment('2013-01-01');
    while (mydate < this.todayMoment) {
      let date = mydate.toDate();
      this.referenceDateArray.push(date);
      this.xAxisValueArray.push(formatDate(date, 'yyyy-MM', 'nl'));
      mydate = mydate.add(6, 'M');
    }
  }
}

export class GraphData {
  Title: string = '';
  SubTitle: string = '';
  Data: any = [];
  xAxis: any = [];
  yAxisTitle: string = '';
  LegendaSuffix: string = '';
  LabelFormat: string = '';
  TooltipFormat: string = '';
}