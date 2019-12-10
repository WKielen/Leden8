import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { LedenService, LedenItem } from './../../services/leden.service';
import { MatTableDataSource, MatDialog, MatSnackBar, MatTable } from '@angular/material';
import { LedenDeleteDialogComponent } from '../ledenmanager/ledendelete.dialog';
import { AppError } from '../../common/error-handling/app-error';
import { DuplicateKeyError } from '../../common/error-handling/duplicate-key-error';
import { NotFoundError } from '../../common/error-handling/not-found-error';
import { LedenDialogComponent } from './ledenmanager.dialog';
import { SnackbarTexts } from 'src/app/common/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/components/parent.component';
import { SingleMailDialogComponent, SingleMail } from '../mail/singlemail.dialog';
import { NoChangesMadeError } from 'src/app/common/error-handling/no-changes-made-error';

@Component({
    selector: 'app-leden',
    templateUrl: './ledenmanager.component.html',
    styleUrls: ['./ledenmanager.component.scss'],
})

export class LedenManagerComponent extends ParentComponent implements OnInit {

    @ViewChild(MatTable, {static: false}) table: MatTable<any>;

    displayedColumns: string[] = ['select', 'Naam', 'Leeftijd'];
    dataSource = new MatTableDataSource<LedenItem>();
    selection = new SelectionModel<LedenItem>(true, []); //used for checkboxes
    fabButtons = [];  // dit zijn de buttons op het scherm
    fabIcons = [{ icon: 'add' }];

    constructor(private ledenService: LedenService,
        protected snackBar: MatSnackBar,
        public dialog: MatDialog) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.registerSubscription(
            this.ledenService.getActiveMembers$()
                .subscribe((data: Array<LedenItem>) => {
                    this.dataSource.data = data;
                }));
        this.fabButtons = this.fabIcons;  // plaats add button op scherm
    }

    /***************************************************************************************************
    / Een van de buttons is geclicked
    /***************************************************************************************************/
    onFabClick(event, buttonNbr): void {
        switch (event.srcElement.innerText) {
            case 'delete':
                this.onDelete();
                break;
            case 'edit':
                this.onEdit();
                break;
            case 'add':
                this.onAdd();
                break;
        }
    }

    /***************************************************************************************************
    / Er gaat een nieuw lid worden opgevoerd. We halen eerst een nieuw lidnummer op.
    /***************************************************************************************************/
    async onAdd(): Promise<void> {
        // Hier wordt de call SYNC uitgevoerd!!!!
        // -------------------------------------------------------- :o)
        const tmpJson = await this.ledenService.getNewLidnr$()
            .toPromise()
            .then(response => response as string);
        // -------------------------------------------------------- :o)

        const toBeAdded = new LedenItem();
        toBeAdded.LidVanaf = new Date().to_YYYY_MM_DD();
        toBeAdded.LidNr = Number(tmpJson['maxlidnr']) + 1;

        let tmp;
        this.dialog.open(LedenDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Toevoegen', 'data': toBeAdded }
        })
            .afterClosed()  // returns an observable
            .subscribe(result => {
                if (result) {  // in case of cancel the result will be false
                    let sub = this.ledenService.create$(result)
                        .subscribe(addResult => {
                            tmp = addResult;
                            result.Id = tmp.Key;
                            this.dataSource.data.unshift(result); // voeg de regel vooraan in de tabel toe.
                            this.refreshTableLayout();
                            this.showSnackBar(SnackbarTexts.SuccessNewRecord);
                            if (LedenItem.GetEmailList(toBeAdded).length > 0) {
                                this.showMailDialog(toBeAdded, 'add');
                            }
                        },
                            (error: AppError) => {
                                if (error instanceof DuplicateKeyError) {
                                    this.showSnackBar(SnackbarTexts.DuplicateKey);
                                } else { throw error; }
                            }
                        );
                    this.registerSubscription(sub);
                }
            });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onDelete(): void {
        let toBeDeleted = this.selection.selected[0];
        toBeDeleted.LidTot = new Date().to_YYYY_MM_DD();
        const dialogRef = this.dialog.open(LedenDeleteDialogComponent, {
            panelClass: 'custom-dialog-container', width: '300px',
            data: { 'method': 'Opzeggen', 'data': toBeDeleted }
        });

        dialogRef.afterClosed().subscribe((result: LedenItem) => {
            // console.log('received in OnEdit from dialog', result);
            if (result) {  // in case of cancel the result will be false
                toBeDeleted.LidTot = result.LidTot;
                const updateRecord = { 'LidNr': result.LidNr, 'Opgezegd': '1', 'LidTot': result.LidTot };
                let sub = this.ledenService.update$(updateRecord)
                    .subscribe(data => {
                        this.refreshTableLayout();
                        this.showSnackBar('Jammer, dat dit lid heeft opgezegd');
                        if (LedenItem.GetEmailList(toBeDeleted).length > 0) {
                            this.showMailDialog(toBeDeleted, 'delete');
                        }
                    },
                        (error: AppError) => {
                            if (error instanceof NotFoundError) {
                                this.showSnackBar(SnackbarTexts.NotFound);
                            }
                            this.showSnackBar(SnackbarTexts.NoChanges);
                        });
                this.registerSubscription(sub);
            }
        });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onEdit(): void {
        const toBeEdited: LedenItem = this.selection.selected[0];

        const dialogRef = this.dialog.open(LedenDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Wijzigen', 'data': toBeEdited }
        });

        dialogRef.afterClosed().subscribe((result: LedenItem) => {
            // console.log('received in OnEdit from dialog');
            if (result) {  // in case of cancel the result will be false
                let sub = this.ledenService.update$(result)
                    .subscribe(data => {
                        this.showSnackBar(SnackbarTexts.SuccessFulSaved);
                    },
                        (error: AppError) => {
                            if (error instanceof NoChangesMadeError) {
                                this.showSnackBar(SnackbarTexts.NoChanges);
                            } else { throw error; }
                        });
                this.registerSubscription(sub);
            }
        });
    }

    /***************************************************************************************************
    / Na het toevoegen of verwijderen van een lid wordt de mail dialoog getoond zodat er een bevestiging
    / verstuurd kan worden.
    /***************************************************************************************************/
    showMailDialog(lid: LedenItem, action: string): void {
        let data = new SingleMail();
        switch (action) {
            case 'add':
                data.TemplatePathandName = 'templates/template_aanmelding.txt';
                data.Subject = "Aanmelding als nieuw lid bij TTVN";
                break;
            case 'delete':
                data.TemplatePathandName = 'templates/template_opzegging.txt';
                data.Subject = "Opzegging lidmaatschap TTVN";
                break;
        }

        data.Lid = lid;

        this.dialog.open(SingleMailDialogComponent, {
            panelClass: 'custom-dialog-container', width: '800px',
            data: data
        })
    }

    /***************************************************************************************************
    / als 1 van de checkboxes wijzigt, ga ik kijken of er andere buttons getoond moeten worden.
    /***************************************************************************************************/
    onCheckboxChange(event, row): void {
        this.updateIcons(this.selection.selected.length + (event.checked ? 1 : -1));

        // handel het oorspronkelijke event af
        if (event) {
            return this.selection.toggle(row);
        } else {
            return null;
        }
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private refreshTableLayout(): void {
        // this.table.dataSource = this.dataSource;
        this.table.renderRows();
        this.selection.clear();
        this.updateIcons(0);
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private updateIcons(length: number): void {
        if (length === 0) {
            this.fabIcons = [{ icon: 'add' }];
        } else if (length === 1) {
            this.fabIcons = [{ icon: 'delete' }, { icon: 'edit' }];
        } else if (length > 1) {
            this.fabIcons = [];
        }
        this.fabButtons = this.fabIcons; // toon de buttons
    }
}
