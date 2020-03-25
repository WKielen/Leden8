import { Component, OnInit, ViewChild, Output } from '@angular/core';
import { LedenService, LedenItemExt } from '../../services/leden.service';
import { TrainingService, TrainingDag, TrainingItem } from '../../services/training.service';
import { MatTableDataSource, MatSnackBar, MatTable, DateAdapter, MatDatepickerInputEvent, MatDatepicker } from '@angular/material';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { MAT_CHECKBOX_CLICK_ACTION } from '@angular/material';

import { AppError } from 'src/app/shared/error-handling/app-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
  selector: 'app-trainingdeelname',
  templateUrl: './trainingdeelname.component.html',
  styleUrls: ['./trainingdeelname.component.scss'],
  providers: [
    { provide: MAT_CHECKBOX_CLICK_ACTION, useValue: 'noop' }   // veranderd het click gedrag van (alle) checkboxen. Zie material docs
  ],
})
export class TrainingDeelnameComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, {static: false}) table: MatTable<any>;
  @ViewChild('picker', {static: false}) picker: MatDatepicker<any>;

  public displayedColumns: string[] = ['Naam', 'Aanwezig'];
  public dataSource = new MatTableDataSource<LedenItemTableRow>();
  public fabButtons = [];  // dit zijn de buttons op het scherm
  public fabIcons = [{ icon: 'save' }, { icon: 'event' }];
  // When I change the date, the ledenlist will not be refreshed. It is read just once at page load.
  public ledenList: Array<LedenItemExt> = [];
  public trainingDag = new TrainingDag();  // contains the Date and a array of players who where present

  constructor(
    protected ledenService: LedenService,
    protected trainingService: TrainingService,
    protected snackBar: MatSnackBar,
    protected adapter: DateAdapter<any>
  ) {
    super(snackBar)
    this.adapter.setLocale('nl');
  }

  ngOnInit(): void {
    this.getPresenceDataFromDate(new Date);  // vandaag dus
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  /***************************************************************************************************
  / Get the data for a specific date
  /***************************************************************************************************/
  private getPresenceDataFromDate(date: Date): void {
    let sub = this.ledenService.getYouthMembers$()
      .subscribe(data => {
        this.ledenList = data;
        this.readAndMergeLedenWithPresence(date);
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Read Presencelist and Merge it with the ledenlist
  /***************************************************************************************************/
  private readAndMergeLedenWithPresence(date: Date): void {
    let sub = this.trainingService.getDate$(date)
      .subscribe(trainingDag => {
        this.trainingDag = trainingDag;
        this.dataSource.data = this.mergeLedenAndPresence(this.ledenList, this.trainingDag);
      },
        (error: AppError) => {  // I create an empty presence day
          this.trainingDag = new TrainingDag();
          this.trainingDag.Datum = date.to_YYYY_MM_DD();
          this.dataSource.data = this.mergeLedenAndPresence(this.ledenList, this.trainingDag);
        });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Merge ledenlist with presencelist
  /***************************************************************************************************/
  private mergeLedenAndPresence(ledenList: Array<LedenItemExt>, trainingDag): Array<LedenItemTableRow> {
    let newList = new Array<LedenItemTableRow>();
    // merge beide tabellen
    ledenList.forEach(lid => {
      let newElement = new LedenItemTableRow(lid.LidNr, lid.Naam);
      trainingDag.DeelnameList.forEach(spelerMetStatus => {
        if (lid.LidNr == spelerMetStatus.LidNr) {
          newElement.SetState(spelerMetStatus.State)  // Copy the state
          return;
        }
      });
      newList.push(newElement);
    });
    return newList;
  }

  /***************************************************************************************************
  / Is triggered when datapicker changed the date.
  /***************************************************************************************************/
  onChangeDate(event: MatDatepickerInputEvent<Date>) {
    // receive presence data of new data and merge it with 'old' ledenlist.
    this.readAndMergeLedenWithPresence(event.value);
  }

  /***************************************************************************************************
  / A Floating Action Button has been pressed.
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {
    switch (buttonNbr) {
      case 0:
        this.savePresence();
        break;
      case 1:
        this.picker.open();
        break;
    }
  }

  /***************************************************************************************************
  / Save the presence for this day
  /***************************************************************************************************/
  private savePresence(): void {
    this.trainingDag.DeelnameList = [];

    this.dataSource.data.forEach(element => {
      if (element.Dirty) {
        let trainingItem = new TrainingItem();
        trainingItem.LidNr = element.LidNr;
        trainingItem.State = element.State;
        this.trainingDag.DeelnameList.push(trainingItem);
      }
    });

    let sub = this.trainingService.updateRec$(this.trainingDag)
      .subscribe(data => {
        this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
      },
        (error: AppError) => {
          if (error instanceof NotFoundError) {
            // Als het record niet is gevonden dan voeg ik het toe.
            let sub2 = this.trainingService.insertRec$(this.trainingDag)
              .subscribe(result => {
                let tmp: any = result;
                this.trainingDag.Id = tmp.Key;
                this.showSnackBar(SnackbarTexts.SuccessNewRecord);
              });
            this.registerSubscription(sub2);
          }
          // Er zijn geen wijzigingen aangebracht.
          else if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          }
          else {
            this.showSnackBar(SnackbarTexts.UpdateError, '');
          }
        });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / The onRowClick from a row that has been hit
  /***************************************************************************************************/
  onRowClick(row: LedenItemTableRow): void {
    row.SetNextState();
  }
}

/***************************************************************************************************
/ Extra velden voor iedere lidregel om de checkbox te besturen.
/***************************************************************************************************/
class LedenItemTableRow {
  constructor(LidNr: number, Naam: string) {
    this.Naam = Naam;
    this.LidNr = LidNr;
    this.Dirty = false;
    this.Checked = null;
    this.Indeterminate = false;
    this.State = TrainingItem.AFWEZIG;
  }

  public SetNextState(): void {
    switch (this.State) { // huidige status
      case TrainingItem.AFGEMELD:
        this.SetState(TrainingItem.AFWEZIG);   // volgende status
        break;
      case TrainingItem.AANWEZIG:
        this.SetState(TrainingItem.AFGEMELD);   // volgende status
        break;
      case TrainingItem.AFWEZIG:
        this.SetState(TrainingItem.AANWEZIG);   // volgende status
        break;
    }
  }

  public SetState(State: number): void {
    //console.log('this', this, State);
    switch (State) {
      case TrainingItem.AANWEZIG:
        // console.log('van afwezig naar aanwezig');
        this.Checked = true;
        this.Indeterminate = false;
        this.State = TrainingItem.AANWEZIG;
        break;
      case TrainingItem.AFGEMELD:
        // console.log('van aanwezig naar afgemeld');
        this.Checked = false;
        this.Indeterminate = true;
        this.State = TrainingItem.AFGEMELD;
        break;
      case TrainingItem.AFWEZIG:
        // console.log('van afgemeld naar afwezig');
        this.Checked = false;
        this.Indeterminate = false;
        this.State = TrainingItem.AFWEZIG;
        break;
    }
    this.Dirty = true;
  }

  Naam: string;
  LidNr: number;
  Dirty: boolean;
  Checked: any;
  Indeterminate: boolean;;
  State: number;
}
