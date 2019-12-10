import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { AgendaService, OrginisatieValues, AgendaItem } from './../../services/agenda.service';
import { MatTableDataSource, MatDialog, MatSnackBar, MatTable } from '@angular/material';
import { AgendaDialogComponent } from '../agenda/agenda.dialog';
import { AppError } from '../../common/error-handling/app-error';
import { DuplicateKeyError } from '../../common/error-handling/duplicate-key-error';
import { NotFoundError } from '../../common/error-handling/not-found-error';
import { SnackbarTexts } from 'src/app/common/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/components/parent.component';
import { NoChangesMadeError } from 'src/app/common/error-handling/no-changes-made-error';

@Component({
    selector: 'app-agenda',
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.scss'],
})

export class AgendaComponent extends ParentComponent implements OnInit {

    @ViewChild(MatTable, {static: false}) table: MatTable<any>;

    displayedColumns: string[] = ['select', 'Datum', 'Tijd', 'EvenementNaam', 'Lokatie', 'Organisatie'];
    dataSource = new MatTableDataSource<AgendaItem>();
    selection = new SelectionModel<AgendaItem>(true, []); //used for checkboxes
    fabButtons = [];  // dit zijn de buttons op het scherm
    fabIcons = [{ icon: 'add' }];

    constructor(
        public snackBar: MatSnackBar,
        private agendaService: AgendaService,
        public dialog: MatDialog) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.registerSubscription(
            this.agendaService.getAll$()
                .subscribe((data: Array<AgendaItem>) => {
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
            case 'playlist_add': // Copy
                this.onCopy();
                break;
            case 'add':
                this.onAdd();
                break;
        }
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private onAdd(): void {
        const toBeAdded = new AgendaItem();
        let tmp;
        this.dialog.open(AgendaDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Toevoegen', 'data': toBeAdded }
        })
            .afterClosed()  // returns an observable
            .subscribe(result => {
                if (result) {  // in case of cancel the result will be false
                    let sub = this.agendaService.create$(result)
                        .subscribe(addResult => {
                            tmp = addResult;
                            result.Id = tmp.Key;
                            this.dataSource.data.unshift(result); // voeg de regel vooraan in de tabel toe.
                            this.refreshTableLayout();
                            this.showSnackBar(SnackbarTexts.SuccessNewRecord);
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
    private onCopy(): void {
        const element = this.selection.selected[0];
        const toBeCopied: any = Object.assign({}, element); // kopieer record
        const index = this.dataSource.data.indexOf(element, 0) + 1;

        let tmp;
        this.dialog.open(AgendaDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Kopiëren', 'data': toBeCopied }
        })
            .afterClosed()  // returns an observable
            .subscribe(result => {
                if (result) {  // in case of cancel the result will be false
                    let sub = this.agendaService.create$(result)
                        .subscribe(addResult => {
                            tmp = addResult;
                            result.Id = tmp.Key;
                            this.dataSource.data.splice(index, 0, result);
                            this.refreshTableLayout();
                            this.showSnackBar(SnackbarTexts.SuccessNewRecord);
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
    private onDelete(): void {
        const toBeDeleted = this.selection.selected;
        toBeDeleted.forEach(element => {
            let sub = this.agendaService.delete$(element.Id)
                .subscribe(data => {
                    //const resp = data;
                    const index = this.dataSource.data.indexOf(element, 0);
                    if (index > -1) {
                        this.dataSource.data.splice(index, 1);
                    }
                    this.refreshTableLayout();
                    this.showSnackBar(SnackbarTexts.SuccessDelete);
                },
                    (error: AppError) => {
                        console.log('error', error);
                        if (error instanceof NotFoundError) {
                            this.showSnackBar(SnackbarTexts.NotFound);
                        } else { throw error; } // global error handler
                    }
                );
            this.registerSubscription(sub);
        });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private onEdit(): void {
        const toBeEdited: AgendaItem = this.selection.selected[0];
        let tmp;
        const dialogRef = this.dialog.open(AgendaDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Wijzigen', 'data': toBeEdited }
        });

        dialogRef.afterClosed().subscribe((result: AgendaItem) => {
            if (result) {  // in case of cancel the result will be false
                let sub = this.agendaService.update$(result)
                    .subscribe(data => {
                        this.showSnackBar(SnackbarTexts.SuccessFulSaved);
                    },
                        (error: AppError) => {
                            if (error instanceof NoChangesMadeError) {
                                this.showSnackBar(SnackbarTexts.NoChanges);
                            } else if (error instanceof NotFoundError) {
                                this.showSnackBar(SnackbarTexts.NotFound);
                            } else { throw error; }
                        });
                this.registerSubscription(sub);
            }
        });
    }

    /***************************************************************************************************
    / HTML helper om juiste organisatie te tonen ipv alleen de db waarde
    /***************************************************************************************************/
    getOrganisatie(value: string): string {
        return OrginisatieValues.GetLabel(value);
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
    / re-render de tabel
    /***************************************************************************************************/
    private refreshTableLayout(): void {
        this.table.dataSource = this.dataSource;
        this.table.renderRows();
        this.selection.clear();
        this.updateIcons(0);
    }

    /***************************************************************************************************
    / Laat de juiste FAB's zien afhankelijk van aantal geselecteerde regels
    /***************************************************************************************************/
    private updateIcons(length: number): void {
        if (length === 0) {
            this.fabIcons = [{ icon: 'add' }];
        } else if (length === 1) {
            this.fabIcons = [{ icon: 'delete' }, { icon: 'edit' }, { icon: 'playlist_add' }];
        } else if (length > 1) {
            this.fabIcons = [{ icon: 'delete' }];
        }
        this.fabButtons = this.fabIcons; // toon de buttons
    }
}

 // see: https://github.com/angular-university/angular-material-course/blob/2-data-table-finished/src/app/services/lessons.datasource.ts