import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { AppError } from '../../shared/error-handling/app-error';
import { ParamService, ParamItem } from 'src/app/services/param.service';
import { WebsiteText } from 'src/app/shared/classes/WebsiteText';
import { WebsiteDialogComponent } from './website.dialog';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
    selector: 'app-website',
    templateUrl: './website.component.html',
    styleUrls: ['./website.component.scss'],
})

export class WebsiteComponent extends ParentComponent implements OnInit {

    @ViewChild(MatTable, {static: false}) table: MatTable<any>;

    columnsToDisplay: string[] = ['StartDate', 'EndDate', 'Header', 'actions2'];
    dataSource = new MatTableDataSource<WebsiteText>();

    constructor(private paramService: ParamService,
        protected snackBar: MatSnackBar,
        public dialog: MatDialog) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.readWebsiteTexts();
    }

    /***************************************************************************************************
    /
    /***************************************************************************************************/
    onAdd(): void {
        const toBeAdded = new WebsiteText();
        this.dialog.open(WebsiteDialogComponent, {
            panelClass: 'custom-dialog-container', width: '500px',
            data: { 'method': 'Toevoegen', 'data': toBeAdded }
        })
            .afterClosed()  // returns an observable
            .subscribe(result => {
                if (result) {  // in case of cancel the result will be false
                    this.dataSource.data.unshift(result); // voeg de regel vooraan in de tabel toe.
                    this.refreshTableLayout();
                    this.saveParam();
                }
            });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onDelete(index: number): void {
        const toBeDeleted: WebsiteText = this.dataSource.data[index];
        this.dataSource.data.splice(index, 1);
        this.saveParam();
        this.refreshTableLayout();
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onEdit(index: number): void {
        let toBeEdited: WebsiteText = this.dataSource.data[index];

        let tmp;
        const dialogRef = this.dialog.open(WebsiteDialogComponent, {
            panelClass: 'custom-dialog-container', width: '800px',
            data: { 'method': 'Wijzigen', 'data': toBeEdited }
        });

        dialogRef.afterClosed().subscribe((result: WebsiteText) => {
            if (result) {  // in case of cancel the result will be false
                this.refreshTableLayout();
                this.saveParam();
            }
        });
    }

    /***************************************************************************************************
    / De tabel is aangepast dus opnieuw renderen
    /***************************************************************************************************/
    private refreshTableLayout(): void {
        this.dataSource.data.sort((item1, item2) => {
            return (item1.StartDate.toString().localeCompare(item2.StartDate.toString(), undefined, { numeric: false }));
        });
        this.table.renderRows();
    }

    /***************************************************************************************************
    / The onRowClick from a row that has been hit
    /***************************************************************************************************/
    onDblclick($event, index): void {
        this.onEdit(index);
    }

    /***************************************************************************************************
    / Lees het record uit de Param tabel
    /***************************************************************************************************/
    private readWebsiteTexts(): void {
        let sub = this.paramService.readParamData$("getinstantwebsitetext", JSON.stringify(new Array<WebsiteText>()), "Mededelingen op website")
            .subscribe(data => {
                let result = data as string;
                this.dataSource.data = JSON.parse(result) as WebsiteText[];
            },
                (error: AppError) => {
                    console.log("error", error);
                }
            )
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Bewaar het record in de Param tabel
    /***************************************************************************************************/
    private saveParam(): void {
        let param = new ParamItem();
        param.Id = 'getinstantwebsitetext';
        param.Description = 'Mededeling op de website';
        param.Value = JSON.stringify(this.dataSource.data);
        console.log('param.Value', param.Value);

        let sub = this.paramService.saveParamData$('getinstantwebsitetext', param.Value, 'Mededeling op de website')
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

 // see: https://github.com/angular-university/angular-material-course/blob/2-data-table-finished/src/app/services/lessons.datasource.ts