import { Component, OnInit, ViewChild } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
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

    displayedColumns: string[] = ['select', 'StartDate', 'EndDate', 'Header'];
    dataSource = new MatTableDataSource<WebsiteText>();
    selection = new SelectionModel<WebsiteText>(true, []); //used for checkboxes
    fabButtons = [];  // dit zijn de buttons op het scherm
    fabIcons = [{ icon: 'add' }];

    constructor(private paramService: ParamService,
        protected snackBar: MatSnackBar,
        public dialog: MatDialog) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.readWebsiteTexts();
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
                    // console.log('result',result);
                    // console.log('this.dataSource.data',this.dataSource.data);
                    this.saveParam();
                }
            });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onDelete(): void {
        const toBeDeleted = this.selection.selected;

        toBeDeleted.forEach(element => {
            const index = this.dataSource.data.indexOf(element, 0);
            if (index > -1) {
                this.dataSource.data.splice(index, 1);
            }
        });
        this.saveParam();
        this.refreshTableLayout();
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onEdit(): void {
        const toBeEdited: WebsiteText = this.selection.selected[0];
        let tmp;
        const dialogRef = this.dialog.open(WebsiteDialogComponent, {
            panelClass: 'custom-dialog-container', width: '800px',
            data: { 'method': 'Wijzigen', 'data': toBeEdited }
        });

        dialogRef.afterClosed().subscribe((result: WebsiteText) => {
            if (result) {  // in case of cancel the result will be false
                this.refreshTableLayout();
                // console.log('result',result);
                // console.log('this.dataSource.data',this.dataSource.data);
                this.saveParam();
            }
        });
    }

    /***************************************************************************************************
    // als 1 van de checkboxes wijzigt, ga ik kijken of er andere buttons getoond moeten worden.
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
    / De tabel is aangepast dus opnieuw renderen
    /***************************************************************************************************/
    refreshTableLayout(): void {
        this.table.dataSource = this.dataSource;
        this.table.renderRows();
        this.selection.clear();
        this.updateIcons(0);
    }

    /***************************************************************************************************
    / De gedisplayde icons is afhankelijk van het aantal geselecteerde leden
    /***************************************************************************************************/
    private updateIcons(length: number): void {
        if (length === 0) {
            this.fabIcons = [{ icon: 'add' }];
        } else if (length === 1) {
            this.fabIcons = [{ icon: 'delete' }, { icon: 'edit' }];
        } else if (length > 1) {
            this.fabIcons = [{ icon: 'delete' }];
        }
        this.fabButtons = this.fabIcons; // toon de buttons
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