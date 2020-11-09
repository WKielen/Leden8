import { Component, OnInit } from '@angular/core';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';

@Component({
  selector: 'app-masterz',
  templateUrl: './masterz.component.html',
  styleUrls: ['./masterz.component.scss']
})

export class MasterzComponent extends ParentComponent implements OnInit {
  public ledenList: Array<LedenItemExt> = [];

  constructor(
    protected ledenService: LedenService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    let sub = this.ledenService.getYouthMembers$()
      .subscribe(data => {
        let tmpList:Array<LedenItemExt> = data;

        for (let i = 0; i < tmpList.length; i++) {
          if (tmpList[i].Leeftijd <= 13) continue;
          this.ledenList.push(tmpList[i]);
        }
      });
    this.registerSubscription(sub);
  }
}
