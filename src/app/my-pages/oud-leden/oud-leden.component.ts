import { Component, OnInit } from '@angular/core';
import { LedenItem, LedenService, LidTypeValues, BetaalWijzeValues } from 'src/app/services/leden.service';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-oud-leden',
  templateUrl: './oud-leden.component.html',
  styleUrls: ['./oud-leden.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class OudLedenComponent implements OnInit {
  constructor(
    private ledenService: LedenService) {
  }

  public ledenDataArray: LedenItem[] = null;
  public columnsToDisplay: string[] = [ 'Naam' , 'LidTot' ];
  public expandedElement; // added on the angular 8 upgrade to suppres error message

  ngOnInit(): void {
    this.ledenService.getRetiredMembers$()
      .subscribe((data: LedenItem[]) => {
        this.ledenDataArray = data;
      });
  }

  /***************************************************************************************************
  / Used in the HTML to display proper text
  /***************************************************************************************************/
  public getLidType(value: string): string {
    return LidTypeValues.GetLabel(value);
  }
}

