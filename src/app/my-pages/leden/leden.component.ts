import { Component, OnInit } from '@angular/core';
import { LedenService, LedenItem, LidTypeValues, BetaalWijzeValues } from '../../services/leden.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { CountingValues } from 'src/app/common/modules/CountingValues';
import { FormControl } from '@angular/forms';
import { MatTableDataSource, MatSnackBar } from '@angular/material';
import { ParentComponent } from 'src/app/components/parent.component';

@Component({
  selector: 'app-leden',
  templateUrl: './leden.component.html',
  styleUrls: ['./leden.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})

export class LedenComponent extends ParentComponent implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    protected ledenService: LedenService) {
    super(snackBar)
  }

  dataSource = new MatTableDataSource();
  public ledenDataArray: LedenItem[] = [];
  public ledenDataArrayNieuw: LedenItem[] = [];
  public ledenDataArrayOpgezegd: LedenItem[] = [];
  public columnsToDisplay: string[] = ['Naam', 'Leeftijd'];
  public categories = new CountingValues([]);
  public expandedElement; // added on the angular 8 upgrade to suppres error message


  nameFilter = new FormControl('');
  ageFilter = new FormControl('');
  filterValues = {
    Naam: '',
    Leeftijd: '',
  };

  ngOnInit(): void {
    let sub = this.ledenService.getActiveMembers$()
      .subscribe((data) => {
        this.ledenDataArray = data;

        data.forEach((lid) => {
          this.categories.Increment(lid.LeeftijdCategorieBond);
          this.categories.Increment(lid.LeeftijdCategorie);
          this.categories.Increment(lid.LeeftijdCategorieWithSex);
          this.categories.Increment('Totaal');

        });
        //      this.fabButtons = this.fabIcons;  // plaats add button op scherm
        this.dataSource.data = this.ledenDataArray;
        this.dataSource.filterPredicate = this.createFilter();
      });
    this.registerSubscription(sub);

    /***************************************************************************************************
    / Er is een key ingetypt op de naam categorie filter: aboneer op de filter
    /***************************************************************************************************/
    let sub2 = this.nameFilter.valueChanges
      .subscribe(
        name => {
          this.filterValues.Naam = name;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.registerSubscription(sub2);

    /***************************************************************************************************
    / Er is een key ingetypt op de leeftijd categorie filter
    /***************************************************************************************************/
    let sub3 = this.ageFilter.valueChanges
      .subscribe(
        age => {
          this.filterValues.Leeftijd = age;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.registerSubscription(sub3);

    /***************************************************************************************************
    / De laatste 5 nieuwe en de laatste 5 opzeggingen
    /***************************************************************************************************/
    let s4 = this.ledenService.getMutaties$()
      .subscribe((data2: LedenItem[]) => {
        this.ledenDataArrayNieuw = data2.slice();  // copy by value
        this.ledenDataArrayOpgezegd = data2.slice();
        this.ledenDataArrayNieuw.splice(5, 5);
        this.ledenDataArrayOpgezegd.splice(0, 5);
      });
    this.registerSubscription(s4);
  }

  /***************************************************************************************************
  / Deze filter wordt bij initialisatie geinitieerd
  /***************************************************************************************************/
  private createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.Naam.toLowerCase().indexOf(searchTerms.Naam.toLowerCase()) !== -1
        && data.LeeftijdCategorieBond.toString().toLowerCase().indexOf(searchTerms.Leeftijd.toLowerCase()) !== -1
    }
    return filterFunction;
  }

  /***************************************************************************************************
  / HTML help functies
  /***************************************************************************************************/
  getLidType(value: string): string {
    return LidTypeValues.GetLabel(value);
  }

  getLidCategory(value: string): number {
    return this.categories.get(value);
  }
}



// <div *ngFor="let step of item.testSteps; let last = last;let odd = odd;">
//     <mat-list-item [ngClass]="{highlighted: odd}">
//     </mat-list-item>
// </div>

// In component CSS:

// .highlighted
// {
//      background-color: whitesmoke;
// }
