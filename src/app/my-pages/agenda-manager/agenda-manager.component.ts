import { Component, OnInit, ViewChild, QueryList, ViewChildren } from '@angular/core';
import { AgendaService, OrginisatieValues, AgendaItem } from './../../services/agenda.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { AgendaDialogComponent } from '../agenda/agenda.dialog';
import { AppError } from '../../shared/error-handling/app-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';
import { NotFoundError } from '../../shared/error-handling/not-found-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
  selector: 'app-agenda-manager',
  templateUrl: './agenda-manager.component.html',
  styleUrls: ['./agenda-manager.component.scss']
})

export class AgendaManagerComponent extends ParentComponent implements OnInit {

    @ViewChild(MatTable, { static: false }) table: MatTable<any>;

    displayedColumns: string[] = ['select', 'Datum', 'Tijd', 'EvenementNaam', 'Lokatie', 'Organisatie'];
    columnsToDisplay: string[] = ['Datum', 'Tijd', 'EvenementNaam', 'Lokatie', 'Organisatie', 'actions3'];
    dataSource = new MatTableDataSource<AgendaItem>();

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
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onAdd(): void {
        this.AddRecord(new AgendaItem);
    }

    onCopy(index: number): void {
        const toBeCopied: AgendaItem = this.dataSource.data[index];
        let toBeAdded: any = Object.assign({}, toBeCopied); // kopieer record
        this.AddRecord(toBeAdded);
    }

    private AddRecord(toBeAdded: AgendaItem) {
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
    onDelete(index: number): void {
        const toBeDeleted: AgendaItem = this.dataSource.data[index];
        let sub = this.agendaService.delete$(toBeDeleted.Id)
            .subscribe(data => {
                this.dataSource.data.splice(index, 1);
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
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onEdit(index: number): void {
        let toBeEdited: AgendaItem = this.dataSource.data[index];

        const dialogRef = this.dialog.open(AgendaDialogComponent, {
            panelClass: 'custom-dialog-container', width: '1200px',
            data: { 'method': 'Wijzigen', 'data': toBeEdited }
        });

        dialogRef.afterClosed().subscribe((result: AgendaItem) => {
            if (result) {  // in case of cancel the result will be false
                let sub = this.agendaService.update$(result)
                    .subscribe(data => {
                        this.refreshTableLayout();
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
    / 
    /***************************************************************************************************/
    private refreshTableLayout(): void {
        this.dataSource.data.sort((item1, item2) => {
            return (item1.Datum.toString().localeCompare(item2.Datum.toString(), undefined, { numeric: false }));
        });
        this.table.renderRows();
    }

    /***************************************************************************************************
    / The onRowClick from a row that has been hit
    /***************************************************************************************************/
    onDblclick($event, index): void {
        this.onEdit(index);
    }


}

 // see: https://github.com/angular-university/angular-material-course/blob/2-data-table-finished/src/app/services/lessons.datasource.ts