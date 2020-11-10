import { Component, OnInit, ViewChild } from '@angular/core';
import { LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ParamService } from 'src/app/services/param.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { MAT_CHECKBOX_DEFAULT_OPTIONS } from '@angular/material/checkbox';

@Component({
  selector: 'app-masterz',
  templateUrl: './masterz.component.html',
  styleUrls: ['./masterz.component.scss'],
  providers: [
    { provide: MAT_CHECKBOX_DEFAULT_OPTIONS, useValue: { clickAction: 'noop' } }   // veranderd het click gedrag van (alle) checkboxen. Zie material docs
  ],
})

export class MasterzComponent extends ParentComponent implements OnInit {
  public ledenList: Array<LedenItemExt> = [];
  public displayedColumns: string[] = ['Naam', 'Leeftijd', 'actions1', ];
  public dataSource = new MatTableDataSource<LedenItemTableRow>();
  public fabButtons = [];  // dit zijn de buttons op het scherm
  public fabIcons = [{ icon: 'save' }];
  private geslaagden: Array<Number> = [];
  @ViewChild(MatTable, { static: false }) table: MatTable<any>;

  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected snackBar: MatSnackBar,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    let sub = this.ledenService.getYouthMembers$()
      .subscribe(data => {
        let tmpList: Array<LedenItemExt> = data;

        for (let i = 0; i < tmpList.length; i++) {
          if (tmpList[i].Leeftijd <= 12 || tmpList[i].CompGerechtigd == '0') continue;
          this.ledenList.push(tmpList[i]);
        }
        this.readAndMergeLedenWithDiploma();
      });
    this.fabButtons = this.fabIcons;  // plaats add button op scherm

    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Read Diplomalist and Merge it with the ledenlist
  /***************************************************************************************************/
  private readAndMergeLedenWithDiploma(): void {
    let sub = this.paramService.readParamData$('Masterz', JSON.stringify(this.geslaagden), 'Geslaagden')
      .subscribe(geslaagden => {
        this.geslaagden = JSON.parse(geslaagden);
        this.dataSource.data = this.mergeLedenAndDiploma(this.ledenList, this.geslaagden);
        console.log('', this.dataSource.data);
      },
        (error: AppError) => {  // I create an empty Diploma day
          this.dataSource.data = this.mergeLedenAndDiploma(this.ledenList, this.geslaagden);
        });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Merge ledenlist with Diplomalist
  /***************************************************************************************************/
  private mergeLedenAndDiploma(ledenList: Array<LedenItemExt>, geslaagden): Array<LedenItemTableRow> {
    let newList = new Array<LedenItemTableRow>();
    // merge beide tabellen
    ledenList.forEach(lid => {
      let newElement = new LedenItemTableRow(lid.LidNr, lid.Naam);
      newElement.Leeftijd = lid.Leeftijd;
      geslaagden.forEach(LidNr => {
        if (lid.LidNr == LidNr) {
          newElement.Checked = true;
          return;
        }
      });
      newList.push(newElement);
    });
    return newList;
  }
  /***************************************************************************************************
  / The onRowClick from a row that has been hit
  /***************************************************************************************************/
  onRowClick(row: LedenItemTableRow): void {
    row.Checked = !row.Checked;
  }

  /***************************************************************************************************
  / A Floating Action Button has been pressed.
  /***************************************************************************************************/
  onFabClick(event, buttonNbr): void {
    this.saveDiploma();
  }

  /***************************************************************************************************
  / Save the Diploma for this day
  /***************************************************************************************************/
  private saveDiploma(): void {
    this.geslaagden = [];
    this.dataSource.data.forEach(element => {
      if (element.Checked) {
        this.geslaagden.push(element.LidNr);
      }
    });

    let sub = this.paramService.saveParamData$('Masterz', JSON.stringify(this.geslaagden), 'geslaagden')
      .subscribe(data => {
        this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
      },
        (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          }
          else if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          }
          else {
            this.showSnackBar(SnackbarTexts.UpdateError, '');
          }
        });
    this.registerSubscription(sub);
  }


}



/***************************************************************************************************
/ Extra velden voor iedere lidregel om de checkbox te besturen.
/***************************************************************************************************/
class LedenItemTableRow {
  constructor(LidNr: number, Naam: string) {
    this.Naam = Naam;
    this.LidNr = LidNr;
    this.Leeftijd = 0;
    this.Checked = null;
  }
  Naam: string;
  Leeftijd: number;
  LidNr: number;
  Checked: any;
}





/*
Beste TTVN-er,

'Veilig sporten' is de speerpunten van het NOC/NSF (Nederlands Olympisch Comite). Bij 'Veilig sporten' kan je denken aan regels tegen pesten, ongewenste opmerkingen en aanrakingen. Naast deze zaken valt ook het spelen van wedstrijden onder 'Veilig sporten'. Hier moet je er aan denken dat het prettig is als je tegenstander volgens dezelfde spelregels speelt, als jij. 
Om dit te bereiken, heeft het NOC/NSF bepaald dat alle jeugdsporten op de hoogte moeten zijn van de spelregels van hun sport. Dit geldt dus ook voor tafeltennissers. 
Onze eigen bond, de Nationale Tafeltennisbond (NTTB), heeft bepaald dat alle jeugdspelers van 13 jaar en ouder moeten laten zien dat ze op de hoogte zijn van de spelregels. Ze hebben daarvoor een test gemaakt die je via een website kan invullen. Op website staan ook de belangrijkste spelregels en oefentoetsen.
Dus als je 13 of ouder bent en je gaat competitie spelen dan moet je deze test doen. 

Het werkt als volgt:
1. Ga naar www.tafeltennismasterz.nl
2. Voer je bondsnummer in
3. Klik op  [Wachtwoord (opnieuw) instellen]
4. Je ontvangt een mail met bevestigingslink. Je ontvangt deze op het mailadres dat jij of je ouders aan TTVN hebt doorgegeven.
5. Klik op de link
6. Vervolgens wordt gevraagd om een wachtwoord (Zelf bedenken!)
7. Vul het wachtwoord twee keer in en bevestig
8. Je kunt inloggen met je bondsnummer en wachtwoord

Als je je bondsnummer of email niet meer weet, neem dan contact op met mij.



*/