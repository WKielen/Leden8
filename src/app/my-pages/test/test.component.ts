import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenItemExt, LedenService, LedenItem } from 'src/app/services/leden.service';
import { MatSnackBar, MatGridList, MatDialog } from '@angular/material';
import * as moment from 'moment';
import { Observable, forkJoin } from 'rxjs';
import { TrainingService } from 'src/app/services/training.service';
import { calcBetweenDates } from 'src/app/common/modules/DateRoutines';
import { Dictionary } from 'src/app/common/modules/Dictionary';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from 'src/app/common/error-handling/app-error';
import { AuthService } from 'src/app/services/auth.service';
import { TrainingOverzichtDialogComponent } from '../trainingoverzicht/trainingoverzicht.dialog';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  @ViewChild(MatGridList, {static: false}) table: MatGridList;
  public NAME_COL_SIZE: number = 3;

  private columns: Array<Date> = [];   // De kolommen waar de datums in staan
  private headerTiles: Array<Tile> = [];
  private deelNameTiles: Array<Tile> = [];
  private ledenList: Array<LedenItemExt> = [];
  private databaseRecord = new DatabaseRecord();
  private aanwezigheidsList = new Dictionary([]);  // lijst key is lidnr, value is datumlijst met status  

  fabButtons = [];  // dit zijn de buttons op het scherm
  fabIcons = [{ icon: 'menu' }];

  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected trainingService: TrainingService,
    protected authService: AuthService,
    protected dialog: MatDialog,
    protected snackBar: MatSnackBar,
  ) {
  }

  /***************************************************************************************************
  / De eerste call om de param te lezen wordt SYNC uitgevoerd. Dit doe ik omdat de eerste keer het param
  / record nog niet aanwezig is. Het wordt dan gecreerd. Eerst had ik deze call in de 'forkJoin' zitten
  / maar daar valt hij uit vanwege de NotFound Error. Daarom apart en sync omdat de data nodig is 
  / voordat de bovenste regel gevuld kan worden. Nu weet ik zeker dat de data er is.
  / Als je denkt dat dit anders en netter kan dan hoor ik het graag.
  /***************************************************************************************************/
  ngOnInit() {
    this.readOrCreateParamRecord();  // zie tekst in kop
    this.requestDataFromMultipleSources()
      // Alle gevraagde gegevens zijn binnen
      .subscribe(responseList => {
        this.ledenList = responseList[0];
        this.aanwezigheidsList = this.ReorganisePresenceArray(responseList[1]);

        this.FillFirstRow();
        this.FillLedenRows(this.aanwezigheidsList);
      })
    this.fabButtons = this.fabIcons;  // plaats add button op scherm
  }

  /***************************************************************************************************
  / De SYNC call voor het ophalen van de parameter
  /***************************************************************************************************/
  async readOrCreateParamRecord() {
    await this.readParamData$()
      .toPromise()
      .catch(e => { })   // Hier wordt de NotFound weggevangen
      .then(response => {
        if (response) {  // In geval van een NotFound is de response leeg
          this.databaseRecord = JSON.parse(response as string);
        }
      });
  }

  /***************************************************************************************************
  / Haal de volgende gegevens op en ga verder als ze allemaal klaar zijn
  / 1. Jeugdleden
  / 2. Aanwezigheids registratie
  /***************************************************************************************************/
  private requestDataFromMultipleSources(): Observable<any[]> {
    let response1 = this.ledenService.getYouthMembers$();
    let response2 = this.trainingService.getFromDate$(new Date('2019-01-01'));

    return forkJoin([response1, response2]);
  }

  /***************************************************************************************************
  / Read the Parameterfrom the database
  /***************************************************************************************************/
  private readParamData$(): Observable<Object> {
    this.databaseRecord.displayDaysOfWeek = [1, 3, 4];
    return this.paramService.readParamData$("PresenceOverviewParams" + this.authService.userId, JSON.stringify(this.databaseRecord), 'Parameters deelname training overzicht');
  }

  /***************************************************************************************************
   / We zijn via de Exit button uit de dialog gekomen. Nu de wijzigingen bewaren in de param tabel
   / - Voorkeurs trainingsdagen
   /***************************************************************************************************/
  private SaveChangedParamFields(param: DatabaseRecord): void {
    this.paramService.saveParamData$("PresenceOverviewParams" + this.authService.userId, JSON.stringify(param), 'Parameters deelname training overzicht')
      .subscribe(data => {
        // console.log('Saved', data);
      },
        (error: AppError) => {
          console.log('Error', error);
        });
  }

  /***************************************************************************************************
  / Fill the leden rows
  /***************************************************************************************************/
  private FillLedenRows(aanwezigheidsList): void {

    this.deelNameTiles = [];
    for (let i = 0; i < this.ledenList.length; i++) {
      let lid = this.ledenList[i];

      // Create the first tile of the row with the name of the member
      let tile = new Tile(this.ledenList[i].VolledigeNaam, '#babdbe', '', this.NAME_COL_SIZE);
      this.deelNameTiles.push(tile);

      let data = aanwezigheidsList.get(lid.LidNr.toString());  // lijst met datums uit de dictionary

      for (let j = 0; j < this.columns.length; j++) {       // Voor alle datums in de header ga ik zoeken of het lid aanwezig was
        let tile = new Tile('', 'lightgrey', '');               // default grijs
        if (data == null) {                                 // er is niets ingevuld voor deze datum
          this.deelNameTiles.push(tile);
        } else {
          for (let z = 0; z < data.length; z++) {           // Er zijn datums maar zit de zoekdatum ertussen?
            if (data[z].Date == this.columns[j].to_YYYY_MM_DD()) {    // Gevonden, nu naar de state kijken.
              switch (data[z].State) {
                case 0:
                  tile.color = Tile.GEEN_STATUS_COLOR;
                  break;
                case 1:
                  tile.color = Tile.AANWEZIG_COLOR;
                  break;
                case 2:
                  tile.color = Tile.AFGEMELD_COLOR;
                  break;
              }
            }
          }
          this.deelNameTiles.push(tile);
        }
      }
    }
  }

  /***************************************************************************************************
  / Fill the first row with the dates
  /***************************************************************************************************/
  private FillFirstRow(): void {
    let beginOfSeasonDate: Date = this.CalculateBeginOfSeasonDate();
    let numberOfDays = calcBetweenDates(new Date(), beginOfSeasonDate).days + 1; // aantal dagen 

    let tile = new Tile('', '#babdbe', '', this.NAME_COL_SIZE);
    this.headerTiles = [];
    this.columns = [];
    this.headerTiles.push(tile);

    for (let i = 0; i < numberOfDays; i++) {
      let date: Date = moment(beginOfSeasonDate).add(i, 'days').toDate();
      if (this.databaseRecord.displayDaysOfWeek.indexOf(date.getDay()) !== -1) {
        this.columns.push(date);
        let color = '#babdbe';
        switch (date.getDay()) {
          case 0: color = '#babdbe'; break;  // https://material.io/resources/color/#!/?view.left=0&view.right=0
          case 1: color = '#9ea7aa'; break;  // De kleuren zijn van de Blue Grey variant
          case 2: color = '#808e95'; break;
          case 3: color = '#62757f'; break;
          case 4: color = '#4b636e'; break;
        }
        let tile = new Tile(date.to_YYYY_MM_DD(), color, date.toLocaleDateString('nl-NL', { weekday: 'long' }));
        this.headerTiles.push(tile);
      }
    }
  }

  /***************************************************************************************************
  / Bereken het begin van het seizoen. Dat is 1 juli of 1 januari afhankelijk van huidige datum
  /***************************************************************************************************/
  private CalculateBeginOfSeasonDate(): Date {
    let tmp = '';
    if ((new Date()).getMonth() < 8)
      tmp = '-01-01';
    else
      tmp = '-08-15'
    return new Date((new Date()).getFullYear().toString() + tmp);
  }

  /***************************************************************************************************
  / De input bevat Lidnr en status per datum
  / De output bevat een Dictorary met Datum en status per lid. 
  /***************************************************************************************************/
  private ReorganisePresenceArray(PresenceList: Array<any>) {
    let list: Dictionary = new Dictionary([]);
    // PresenceList: De lijst met ingevulde aanwezigheid
    PresenceList.forEach(dag => {
      JSON.parse(dag.Value).forEach(lid => {  // De waarde bevat lidnrs en de status
        if (list.containsKey(lid.LidNr.toString())) {
          list.get(lid.LidNr.toString()).push({ 'Date': dag.Datum, 'State': lid.State });
        } else {
          list.add(lid.LidNr.toString(), [{ 'Date': dag.Datum, 'State': lid.State }]);
        }
      });
    });
    return list;
  }

  /***************************************************************************************************
  / Een van de buttons is geclicked
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {
    let dialogRecord = new DialogRecord();
    dialogRecord.displayDaysOfWeek = this.databaseRecord.displayDaysOfWeek;
    dialogRecord.downloadList = this.createDownloadList();
    // console.log('dialogRecord', dialogRecord);

    this.dialog.open(TrainingOverzichtDialogComponent, {
      panelClass: 'custom-dialog-container', width: '500px',
      data: dialogRecord
    })
      .afterClosed()  // returns an observable
      .subscribe(result => {
        // in case of cancel the result will be false
        if (result) {
          this.databaseRecord.displayDaysOfWeek = result.displayDaysOfWeek;

          this.SaveChangedParamFields(this.databaseRecord);

          // repaint the form
          this.FillFirstRow();
          this.FillLedenRows(this.aanwezigheidsList);

        }
      });
  }

  /***************************************************************************************************
  / TODO:
  / dialog opmaken
  / van test naar eigen bestanden
  / alle datums laten zien. Niet alleen geslecteerde
  /***************************************************************************************************/
  private createDownloadList(): string {
    let string = '';
    this.headerTiles.forEach(tile => {
      string += tile.text + ';';
    });
    string += '\n';

    for (let i = 0; i < this.ledenList.length; i++) {
      string += this.deelNameTiles[(i * this.headerTiles.length)].text;
      for (let j = 1; j < this.headerTiles.length; j++) {
        string += this.deelNameTiles[(i * this.headerTiles.length) + j].state() + ';';
      }
      string += '\n';
    }
    return string;
  }
}

/***************************************************************************************************
/ Een tegel in de grid
/***************************************************************************************************/
class Tile {
  constructor(public text: string, public color: string, private toolTip: string, private cols: number = 1) { }

  public static readonly GEEN_STATUS_COLOR = 'lightgrey';
  public static readonly AANWEZIG_COLOR = 'green';
  public static readonly AFGEMELD_COLOR = 'blue';

  public state(): string {
    switch (this.color) {
      case Tile.AANWEZIG_COLOR:
        return 'Aanwezig';
      case Tile.AFGEMELD_COLOR:
        return 'Afgemeld';
      default:
        return '';
    }
  }
}

/***************************************************************************************************
/ This record is sent to the dialog
/***************************************************************************************************/
export class DialogRecord {
  public displayDaysOfWeek: Array<number>;
  public downloadList: string;
}

/***************************************************************************************************
/ This record is stored as param in the db
/***************************************************************************************************/
export class DatabaseRecord {
  constructor(
    public displayDaysOfWeek: Array<number> = []) { }
}