import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ExportToCsv } from 'export-to-csv';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { CreateBerekenOverzicht, CreateDirectDebits, CreateContributieMail } from 'src/app/shared/modules/ContributieCalcFunctions';
import { ContributieBedragen } from "src/app/shared/classes/ContributieBedragen";
import { DirectDebit } from 'src/app/shared/classes/DirectDebit';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { LedenItemExt, LedenService, LidTypeValues } from 'src/app/services/leden.service';
import { ExternalMailApiRecord, MailItem } from 'src/app/services/mail.service';
import { ParamItem, ParamService } from 'src/app/services/param.service';
import { MailDialogComponent } from '../mail/mail.dialog';
import { formatDate } from '@angular/common';

@Component({
  selector: 'app-contr-bedragen',
  templateUrl: './contr-bedragen.component.html',
  styleUrls: ['./contr-bedragen.component.scss']
})
export class ContrBedragenComponent extends ParentComponent implements OnInit {

  contributieBedragen = new ContributieBedragen();
  secondaryFeeParams = new SecondaryFeeParams();
  requestedDirectDebitDate = new FormControl();
  ledenArray: LedenItemExt[] = [];
  paramItem = new ParamItem();

  csvOptions = {
    fieldSeparator: ';',
    quoteStrings: '"',
    decimalSeparator: ',',
    showLabels: true,
    showTitle: false,
    title: 'Contributielijst',
    useTextFile: false,
    useBom: true,
    useKeysAsHeaders: true,
    filename: ''
    // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
  };

  contributieForm = new FormGroup({
    HalfjaarVolwassenen: new FormControl(
      '',
      [Validators.required]
    ),
    HalfjaarJeugd: new FormControl(
      '',
      [Validators.required]
    ),
    CompetitieBijdrageVolwassenen: new FormControl(
      '',
      [Validators.required]
    ),
    CompetitieBijdrageJeugd: new FormControl(
      '',
      [Validators.required]
    ),
    HalfjaarBondBijdrage: new FormControl(
      '',
      [Validators.required]
    ),
    ZwerflidPercentage: new FormControl(
      '',
      [Validators.required]
    ),
    KostenRekening: new FormControl(
      '',
      [Validators.required]
    ),
    KortingVrijwilliger: new FormControl(
      '',
      [Validators.required]
    ),
  });

  incassoForm = new FormGroup({
    Omschrijving: new FormControl(
      '',
      [Validators.required]
    ),
    OudeBerekenMethode: new FormControl(),
  });

  constructor(
    // private adapter: DateAdapter<any>,
    protected paramService: ParamService,
    protected ledenService: LedenService,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super(snackBar)
    // this.adapter.setLocale('nl');
    this.Omschrijving.setValue('Contributie VNJ-20nn');
  }

  ngOnInit(): void {
    this.readContributieBedragen();
    this.readSecondaryFeeParams();
    this.readActiveMembers();
  }

  /***************************************************************************************************
  / Lees de contributie bedragen uit de Param tabel
  /***************************************************************************************************/
  readContributieBedragen(): void {
    let sub = this.paramService.readParamData$("ContributieBedragen", JSON.stringify(new ContributieBedragen()), 'Contributie bedragen')
      .subscribe(data => {
        this.contributieBedragen = JSON.parse(data as string) as ContributieBedragen;
        this.HalfjaarVolwassenen.setValue(this.contributieBedragen.HalfjaarVolwassenen);
        this.HalfjaarJeugd.setValue(this.contributieBedragen.HalfjaarJeugd);
        this.CompetitieBijdrageVolwassenen.setValue(this.contributieBedragen.CompetitieBijdrageVolwassenen);
        this.CompetitieBijdrageJeugd.setValue(this.contributieBedragen.CompetitieBijdrageJeugd);
        this.HalfjaarBondBijdrage.setValue(this.contributieBedragen.HalfjaarBondBijdrage);
        this.ZwerflidPercentage.setValue(this.contributieBedragen.ZwerflidPercentage);
        this.KostenRekening.setValue(this.contributieBedragen.KostenRekening);
        this.KortingVrijwilliger.setValue(this.contributieBedragen.KortingVrijwilliger);
      },
        (error: AppError) => {
          console.log("error", error);
        }
      )
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Lees de extra param uit de Param tabel
  / - Omschrijving op afschrift
  / - Extra tekst op contributie email
  / - Verwachte incasso datum op email 
  /***************************************************************************************************/
  readSecondaryFeeParams(): void {
    let sub = this.paramService.readParamData$("SecondaryFeeParams", JSON.stringify(new SecondaryFeeParams()), 'Extra contributie parameters')
      .subscribe(data => {
        this.secondaryFeeParams = JSON.parse(data as string) as SecondaryFeeParams;
        this.Omschrijving.setValue(this.secondaryFeeParams.Description);
        this.requestedDirectDebitDate.setValue(new Date(this.secondaryFeeParams.RequestedDirectDebitDate));
      },
        (error: AppError) => {
          console.log("error", error);
        }
      )
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Lees de leden waarvoor de contributie moet worden gemaakt. 'true' betekent dat ook de IBAN wordt ingelezen
  /***************************************************************************************************/
  readActiveMembers(): void {
    let sub = this.ledenService.getActiveMembers$(true)
      .subscribe((data) => {
        this.ledenArray = data;
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / De SAVE knop van de contributie bedragen
  /***************************************************************************************************/
  onSaveBedragen(): void {
    this.contributieBedragen.HalfjaarVolwassenen = this.HalfjaarVolwassenen.value;
    this.contributieBedragen.HalfjaarJeugd = this.HalfjaarJeugd.value;
    this.contributieBedragen.CompetitieBijdrageVolwassenen = this.CompetitieBijdrageVolwassenen.value;
    this.contributieBedragen.CompetitieBijdrageJeugd = this.CompetitieBijdrageJeugd.value;
    this.contributieBedragen.HalfjaarBondBijdrage = this.HalfjaarBondBijdrage.value;
    this.contributieBedragen.ZwerflidPercentage = this.ZwerflidPercentage.value;
    this.contributieBedragen.KostenRekening = this.KostenRekening.value;
    this.contributieBedragen.KortingVrijwilliger = this.KortingVrijwilliger.value;
    this.paramItem.Value = JSON.stringify(this.contributieBedragen);

    let sub = this.paramService.saveParamData$("ContributieBedragen", JSON.stringify(this.contributieBedragen), 'Contributie bedragen')
      .subscribe(data => {
        this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
      },
        (error: AppError) => {
          if (error instanceof NoChangesMadeError) {
            this.showSnackBar(SnackbarTexts.NoChanges, '');
          } else { throw error; }
        });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Maak een incasso bestand. Dit is een input bestand voor sepabestand.nl
  /***************************************************************************************************/
  onIncassoBestand(): void {
    let directDebits: DirectDebit[] = CreateDirectDebits(this.ledenArray, this.contributieBedragen, this.Omschrijving.value, this.OudeBerekenMethode.value)
    this.csvOptions.filename = "TTVN Incasso " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(directDebits);
  }

  /***************************************************************************************************
  / Maak een bestand om de rekeningen te maken voor de zelfbetalers
  /***************************************************************************************************/
  onRekeningBestand(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, this.OudeBerekenMethode.value, 'R', this.Omschrijving.value);
    this.csvOptions.filename = "TTVN Rekeningen " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Maak een bestand om de rekeningen te maken voor de UPAS en Nieuwegeinpas houders.
  /***************************************************************************************************/
  onAndersBetalenden(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, this.OudeBerekenMethode.value, 'U', this.Omschrijving.value);
    this.csvOptions.filename = "TTVN Nieuwegeinpas " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Maak een overzicht van alle gegevens die zijn gebruikt bij het berekenen van de contributie 
  /***************************************************************************************************/
  onBerekeningOverzicht(): void {
    let berekeningOverzichten = CreateBerekenOverzicht(this.ledenArray, this.contributieBedragen, this.OudeBerekenMethode.value, '', this.Omschrijving.value);
    this.csvOptions.filename = "TTVN Overzicht berekeningen " + new Date().to_YYYY_MM_DD();
    let csvExporter = new ExportToCsv(this.csvOptions);
    csvExporter.generateCsv(berekeningOverzichten);
  }

  /***************************************************************************************************
  / Als de cursor een van de volgende velden verlaat dan bewaren we de inhoud. (Als service naar de gebruiker)
  / - Omschrijving op afschrift
  / - Extra tekst op contributie email
  / - Verwachte incasso datum op email 
  /***************************************************************************************************/
  onSaveChangedFields(): void {
    this.secondaryFeeParams.Description = this.Omschrijving.value; // alleen deze de andere twee zitten niet in een form
    this.saveSecondaryParams();
  }
  onSaveChangedDate($event): void {
    this.secondaryFeeParams.RequestedDirectDebitDate = $event.value.format('YYYY-MM-DD');
    this.saveSecondaryParams();
  }
  saveSecondaryParams(): void {
    let sub = this.paramService.saveParamData$("SecondaryFeeParams", JSON.stringify(this.secondaryFeeParams), 'Extra contributie parameters')
      .subscribe();
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Verstuur de email
  /***************************************************************************************************/
  onSendMail($event): void {
    let mailDialogInputMessage = new ExternalMailApiRecord();
    mailDialogInputMessage.MailItems = new Array<MailItem>();
    let date = this.requestedDirectDebitDate.value as Date;

    this.ledenArray.forEach(lid => {
      if (lid.LidType == LidTypeValues.CONTRIBUTIEVRIJ) return; // Contributie vrij
      let mailItem = CreateContributieMail(lid, this.contributieBedragen, this.Omschrijving.value, this.OudeBerekenMethode.value, formatDate(date, 'dd-MM-yyyy', 'nl-NL'));
      if (this.secondaryFeeParams.ExtraText != '') {
        mailItem.Message += '\n';
        mailItem.Message += this.secondaryFeeParams.ExtraText;
      }
      mailItem.Message += '\nMet vriendelijke groet,\nPenningmeester TTVN';
      mailDialogInputMessage.MailItems.push(mailItem);
    });

    const dialogRef = this.dialog.open(MailDialogComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: mailDialogInputMessage
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {  // in case of cancel the result will be false
        console.log('result', result);
      }
    });
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get HalfjaarVolwassenen() {
    return this.contributieForm.get('HalfjaarVolwassenen');
  }
  get HalfjaarJeugd() {
    return this.contributieForm.get('HalfjaarJeugd');
  }
  get CompetitieBijdrageVolwassenen() {
    return this.contributieForm.get('CompetitieBijdrageVolwassenen');
  }
  get CompetitieBijdrageJeugd() {
    return this.contributieForm.get('CompetitieBijdrageJeugd');
  }
  get HalfjaarBondBijdrage() {
    return this.contributieForm.get('HalfjaarBondBijdrage');
  }
  get ZwerflidPercentage() {
    return this.contributieForm.get('ZwerflidPercentage');
  }
  get KostenRekening() {
    return this.contributieForm.get('KostenRekening');
  }
  get KortingVrijwilliger() {
    return this.contributieForm.get('KortingVrijwilliger');
  }
  get Omschrijving() {
    return this.incassoForm.get('Omschrijving');
  }
  get OudeBerekenMethode() {
    return this.incassoForm.get('OudeBerekenMethode');
  }
}

/***************************************************************************************************
/ Met deze class worden enkele velden in de param tabel opgeslagen.
/***************************************************************************************************/
class SecondaryFeeParams {
  Description: string = '';
  ExtraText: string = '';
  RequestedDirectDebitDate: string = '';
}