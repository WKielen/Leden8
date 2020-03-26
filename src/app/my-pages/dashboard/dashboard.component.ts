import { Component, OnInit } from '@angular/core';
import { LedenItem, LedenService } from 'src/app/services/leden.service';
import * as moment from 'moment';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  public bigChart = null;

  public ledenDataArray: LedenItem[] = [];
  public referenceDateArray: Date[] = [];
  public xAxisValueArray: string[] = [];
  public memberCountArray: number[] = [];

  constructor(
    public ledenService: LedenService) {
  }

  ngOnInit() {
 
    let sub = this.ledenService.getAll$()
      .subscribe((data: Array<LedenItem>) => {
        this.ledenDataArray = data;


        this.bigChart = this.FillDataArrays();

      });

    // this.registerSubscription(sub);
  }


  FillDataArrays() {
    let tmp =         [{
      name: 'Asia',
      data: [502, 635, 809, 947, 1402, 3634, 5268]
    }, {
      name: 'Africa',
      data: [106, 107, 111, 133, 221, 767, 1766]
    }, {
      name: 'Europe',
      data: [163, 203, 276, 408, 547, 729, 628]
    }, {
      name: 'America',
      data: [18, 31, 54, 156, 339, 818, 1201]
    }, {
      name: 'Oceania',
      data: [2, 2, 2, 6, 13, 30, 46]
    }];


    this.CreateArrayWithReferenceDates();
    this.referenceDateArray.forEach(referenceDate => {
      let count = 0;
      this.ledenDataArray.forEach(lid => {
        count += 1;
      });
      this.memberCountArray.push(count);
    });
    tmp[0].data = this.memberCountArray
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
