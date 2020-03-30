import { Component, OnInit } from '@angular/core';
import { LedenItem, LedenService } from 'src/app/services/leden.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { DateRoutines } from 'src/app/services/leden.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  // input voor de linechart
  public bigChart = null;
  public xAxis = null;

  public ledenDataArray: LedenItem[] = [];
  public referenceDateArray: Date[] = [];
  public xAxisValueArray: string[] = [];
  public countMemberArray: number[] = [];
  public countJuniorMemberArray: number[] = [];
  public countSeniorMemberArray: number[] = [];;

  // input voor pie chart
  public pieChart = [71, 78, 39, 66];




  constructor(
    public ledenService: LedenService) {
  }

  ngOnInit() {

    let sub = this.ledenService.getAll$()
      .subscribe((data: Array<LedenItem>) => {
        this.ledenDataArray = data;


        this.bigChart = this.FillDataArrays();
        this.xAxis = this.xAxisValueArray;

      });

    // this.registerSubscription(sub);
  }


  FillDataArrays() {
    let tmp = [{
      name: 'Totaal',
      data: []
    }, {
      name: 'Volwassenen',
      data: []
    }, {
      name: 'Jeugd',
      data: []
    }
    ];


    this.CreateArrayWithReferenceDates();
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
    tmp[0].data = this.countMemberArray;
    tmp[1].data = this.countSeniorMemberArray;
    tmp[2].data = this.countJuniorMemberArray;
    return tmp;
  }



  CreateArrayWithReferenceDates(): void {
    let mydate = moment('2013-01-01');
    const todayMoment = moment();

    while (mydate < todayMoment) {
      let date = mydate.toDate();
      this.referenceDateArray.push(date);
      this.xAxisValueArray.push(formatDate(date, 'yyyy-MM', 'nl'));
      mydate = mydate.add(6, 'M');
    }
  }

}
