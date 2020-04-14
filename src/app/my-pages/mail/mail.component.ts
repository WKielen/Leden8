import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { LedenService, LedenItem, LedenItemExt } from '../../services/leden.service';
import { AuthService } from '../../services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ParamService } from 'src/app/services/param.service';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { ReplaceCharacters } from 'src/app/shared/modules/ReplaceCharacters';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { MailDialogComponent } from '../mail/mail.dialog';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';
import { ExternalMailApiRecord, MailItem } from 'src/app/services/mail.service';
import { ReplaceKeywords } from 'src/app/shared/modules/ReplaceKeywords';

@Component({
  selector: 'mail',
  templateUrl: './mail.component.html',
  styleUrls: ['./mail.component.scss']
})

export class MailComponent extends ParentComponent implements OnInit {

  @ViewChild(MatTable, {static: false}) table: MatTable<any>;

  dataSource = new MatTableDataSource<LedenItemExt>();
  itemsToMail: Array<LedenItemExt> = [];
  selection = new SelectionModel<LedenItem>(true, []); //used for checkboxes
  displayedColumns: string[] = ['select', 'Naam', 'LeeftijdCategorie'];
  filterValues = {
    LeeftijdCategorieJ: '',
    LeeftijdCategorieV: '',
  };

  mailBoxParam = new MailBoxParam();
  savedMailNames = new MailNameList();

  ckbVolwassenen: boolean = true;
  ckbJeugd: boolean = true;
  showPw: boolean = false;

  mailboxparamForm = new FormGroup({
    EmailAddress: new FormControl(
      '',
      [Validators.required, Validators.email]
    ),
    EmailPassword: new FormControl(
      '',
      [Validators.required]
    ),
    EmailSender: new FormControl()
  });

  mailForm = new FormGroup({
    TypeYourMail: new FormControl(
      '',
      [Validators.required]
    ),
    EmailName: new FormControl(
      '',
      [Validators.required]
    ),
    EmailSubject: new FormControl(
      '',
      [Validators.required]
    ),
    SavedMails: new FormControl(),
  });


  constructor(
    protected ledenService: LedenService,
    protected paramService: ParamService,
    protected authService: AuthService,
    protected snackBar: MatSnackBar,
    private dialog: MatDialog,
  ) {
    super(snackBar)
  }

  ngOnInit(): void {
    this.registerSubscription(
      this.ledenService.getActiveMembers$()
        .subscribe((data: Array<LedenItemExt>) => {
          this.dataSource.data = data;
        }));

    this.dataSource.filterPredicate = this.createFilter();
    this.filterValues.LeeftijdCategorieV = 'volwassenen';
    this.filterValues.LeeftijdCategorieJ = 'jeugd';
    this.dataSource.filter = JSON.stringify(this.filterValues);

    this.readMailList();
  }

  /***************************************************************************************************
  / Verstuur de email
  /***************************************************************************************************/
  onSendMail($event): void {
    let mailDialogInputMessage = new ExternalMailApiRecord();

    mailDialogInputMessage.MailItems = new Array<MailItem>();

    this.itemsToMail.forEach(lid => {
      let mailAddresses: Array<string> = LedenItem.GetEmailList(lid);

      mailAddresses.forEach(element => {
        let itemToMail = new MailItem();
        itemToMail.Message.push(ReplaceKeywords(lid, this.TypeYourMail.value));
        itemToMail.Subject = this.EmailSubject.value;
        itemToMail.To = element;
        mailDialogInputMessage.MailItems.push(itemToMail);
      });
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
  / Hier bepaal ik naar wie er een mail moet worden gestuurd. 
  / Het issue is dat ik niet fatsoenlijk vast kan stellen welke regels er checked zijn binnen
  / de gefilterde regels. 
  /***************************************************************************************************/
  private determineMailToSend(): void {
    var filteredData = this.dataSource.filteredData ? this.dataSource.filteredData : new LedenItemExt()[0];
    var selectedData = this.selection.selected ? this.selection.selected : new LedenItemExt()[0];;

    this.itemsToMail = [];
    for (let i = 0; i < filteredData.length; i++) {
      for (let j = 0; j < selectedData.length; j++) {
        if (filteredData[i].LidNr === selectedData[j].LidNr) {
          this.itemsToMail.push(filteredData[i])
        }
      }
    }
  }

  /***************************************************************************************************
  / Een checkbox van de ledenlijst is gewijzigd. 
  /***************************************************************************************************/
  onCheckboxChange(event, row): void {
    if (event) {
      this.selection.toggle(row);
    } else {
      return null;
    }
    this.determineMailToSend();
  }

  /***************************************************************************************************
  / De waarde van de dropdown met email namen is gewijzigd
  /***************************************************************************************************/
  onMailNameChanged($event): void {
    let key = 'mail' + this.authService.userId + $event.value;
    this.readMail(key);
  }

  /***************************************************************************************************
  / De SAVE knop van de email zelf
  /***************************************************************************************************/
  onSaveEmail(): void {
    let mailSaveItem = new MailSaveItem();
    mailSaveItem.Name = ReplaceCharacters(this.EmailName.value);
    mailSaveItem.Subject = this.EmailSubject.value;
    mailSaveItem.Message = this.TypeYourMail.value;

    let present: boolean = this.savedMailNames.MailNameItems.includes(mailSaveItem.Name);

    if (!present) {
      // Voeg toe aan de namenlijst
      this.savedMailNames.MailNameItems.push(mailSaveItem.Name);

      // bewaar de maillijst
      let sub = this.paramService.saveParamData$('mailist' + this.authService.userId,
        JSON.stringify(this.savedMailNames), 'Maillijst' + this.authService.userId)
        .subscribe(data => {
        },
          (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey, '');
            } else { throw error; }
          });
      this.registerSubscription(sub);

      // Bewaar de email
      let sub2 = this.paramService.createParamData$('mail' + this.authService.userId + mailSaveItem.Name,
        JSON.stringify(mailSaveItem), 'Mail' + this.authService.userId)
        .subscribe(addResult => {
          let tmp = addResult;
          this.showSnackBar(SnackbarTexts.SuccessNewRecord, '');
        },
          (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey, '');
            } else { throw error; }
          }
        );
      this.registerSubscription(sub2);

    }
    else {

      let sub = this.paramService.saveParamData$('mail' + this.authService.userId + mailSaveItem.Name,
        JSON.stringify(mailSaveItem), 'Mail' + this.authService.userId)
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
  }

  /***************************************************************************************************
  / Lees het bewaard mail overzicht uit de Param tabel
  /***************************************************************************************************/
  private readMailList(): void {
    let sub = this.paramService.readParamData$('mailist' + this.authService.userId, JSON.stringify(new MailNameList()), 'Maillijst' + this.authService.userId)
      .subscribe(data => {
        let result = JSON.parse(data as string) as MailNameList;
        this.savedMailNames = result;
      },
        (error: AppError) => {
          console.log("error", error);
        }
      )
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Lees het bewaarde mail uit de Param tabel
  /***************************************************************************************************/
  private readMail(key: string): void {
    let sub = this.paramService.readParamData$(key, JSON.stringify(new MailSaveItem()), 'Mail' + this.authService.userId)
      .subscribe(data => {
        let result = JSON.parse(data as string) as MailSaveItem;
        this.EmailName.setValue(result.Name);
        this.EmailSubject.setValue(result.Subject);
        this.TypeYourMail.setValue(result.Message);
      },
        (error: AppError) => {
          console.log("error", error);
        }
      )
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Verwijder een bewaarde mail uit de Param tabel
  /***************************************************************************************************/
  onDeleteMail(): void {
    // verwijderen uit lijst
    const index = this.savedMailNames.MailNameItems.indexOf(this.SavedMails.value, 0);
    if (index > -1) {
      this.savedMailNames.MailNameItems.splice(index, 1);
    }

    // bewaar de maillijst
    let sub = this.paramService.saveParamData$('mailist' + this.authService.userId,
      JSON.stringify(this.savedMailNames), 'Maillijst' + this.authService.userId)
      .subscribe(data => {
      },
        (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          }
          else { throw error; }
        });
    this.registerSubscription(sub);

    // delete mail
    let key = 'mail' + this.authService.userId + this.SavedMails.value;
    let sub2 = this.paramService.delete$(key)
      .subscribe(addResult => {
        let tmp = addResult;
        this.showSnackBar(SnackbarTexts.SuccessDelete, '');
      },
        (error: AppError) => {
          if (error instanceof NotFoundError) {
            this.showSnackBar(SnackbarTexts.NotFound, '');
          } else { throw error; }
        }
      );
    this.registerSubscription(sub2);
  }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
  get TypeYourMail() {
    return this.mailForm.get('TypeYourMail');
  }
  get EmailName() {
    return this.mailForm.get('EmailName');
  }
  get EmailSubject() {
    return this.mailForm.get('EmailSubject');
  }
  get SavedMails() {
    return this.mailForm.get('SavedMails');
  }

  /***************************************************************************************************
  / Whether the number of selected elements matches the total number of rows.
  /***************************************************************************************************/
  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /***************************************************************************************************
  / Selects all rows if they are not all selected; otherwise clear selection.
  /***************************************************************************************************/
  masterToggle(): void {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
    this.determineMailToSend();
  }

  /***************************************************************************************************
  / The label for the checkbox on the passed row. Voor als de regel wordt geklikt
  /***************************************************************************************************/
  checkboxLabel(row?: LedenItemExt): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.LidNr}`;
  }

  /***************************************************************************************************
  / De senioren zijn verwijderd uit de selectie omdat xxxxxxx geen categorie is
  /***************************************************************************************************/
  onChangeckbVolwassenen($event): void {
    this.filterValues.LeeftijdCategorieV = $event.checked ? 'volwassenen' : 'xxxxxxxxxxxxyz';
    this.dataSource.filter = JSON.stringify(this.filterValues);

    this.dataSource.data.forEach(row => {
      if (row.LeeftijdCategorie === "volwassenen") {
        this.selection.deselect(row)
      }
    });
    this.determineMailToSend();
  }

  /***************************************************************************************************
  / De jeugd is verwijderd uit de selectie omdat xxxxxxx geen jeugdcategorie is
  /***************************************************************************************************/
  onChangeckbJeugd($event): void {
    this.filterValues.LeeftijdCategorieJ = $event.checked ? 'jeugd' : 'xxxxxxxxxxxxxxyz';
    this.dataSource.filter = JSON.stringify(this.filterValues);

    this.dataSource.data.forEach(row => {
      if (row.LeeftijdCategorie === "jeugd") {
        this.selection.deselect(row)
      }
    });
    this.determineMailToSend();
  }

  /***************************************************************************************************
  / This filter is created at initialize of the page.
  /***************************************************************************************************/
  private createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data, filter): boolean {
      let searchTerms = JSON.parse(filter);
      return data.LeeftijdCategorie.toLowerCase().indexOf(searchTerms.LeeftijdCategorieV) !== -1
        || data.LeeftijdCategorie.toLowerCase().indexOf(searchTerms.LeeftijdCategorieJ) !== -1
    }
    return filterFunction;
  }
}

/***************************************************************************************************
/ De classes worden gebruikt om de voorbeeld mails en de mailbox params op te slaan in de param tabel
/***************************************************************************************************/
export class MailBoxParam {
  UserId: string = '';
  Password: string = ''
  Name: string = '';
}

export class MailNameList {
  MailNameItems: string[] = [];
}

export class MailSaveItem {
  Name: string;
  Subject: string;
  Message: string;
}
