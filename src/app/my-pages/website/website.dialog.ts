import { TypeValues, OrginisatieValues, DoelgroepValues } from '../../services/agenda.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormValueToDutchDateString } from 'src/app/common/modules/DateRoutines';


@Component({
    selector: 'app-website-dialog',
    templateUrl: './website.dialog.html',
})
export class WebsiteDialogComponent implements OnInit {
    websiteItemForm = new FormGroup({
        Header: new FormControl(
            '',
            [Validators.required]
        ),
        Text: new FormControl(
            '',
            [Validators.required]
        ),
        StartDate: new FormControl(
            '',
            [Validators.required]
        ),
        EndDate: new FormControl(
            '',
            [Validators.required]
        ),
    });

    typeValues = TypeValues.table;
    orginisatieValues = OrginisatieValues.table;
    doelgroepValues = DoelgroepValues.table;

    constructor(
        public dialogRef: MatDialogRef<WebsiteDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private adapter: DateAdapter<any>) {
        this.adapter.setLocale('nl');
    }

    ngOnInit(): void {
        this.StartDate.setValue(this.data.data.StartDate);
        this.EndDate.setValue(this.data.data.EndDate);
        this.Header.setValue(this.data.data.Header);
        this.Text.setValue(this.data.data.Text);
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onSubmit(): void {
        this.data.data.StartDate = FormValueToDutchDateString(this.StartDate.value);
        this.data.data.EndDate = FormValueToDutchDateString(this.EndDate.value);
        this.data.data.Header = this.Header.value;
        this.data.data.Text = this.Text.value;
        this.dialogRef.close(this.data.data);
    }

  /***************************************************************************************************
  / Properties
  /***************************************************************************************************/
    get Header() {
        return this.websiteItemForm.get('Header');
    }
    get Text() {
        return this.websiteItemForm.get('Text');
    }
    get StartDate() {
        return this.websiteItemForm.get('StartDate');
    }
    get EndDate() {
        return this.websiteItemForm.get('EndDate');
    }

}
