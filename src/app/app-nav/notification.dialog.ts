import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from 'src/app/services/param.service';
import { MailBoxParam } from '../my-pages/mail/mail.component';
import { AppError } from '../common/error-handling/app-error';
import { NotFoundError } from '../common/error-handling/not-found-error';
import { DuplicateKeyError } from '../common/error-handling/duplicate-key-error';
import { SnackbarTexts } from '../common/error-handling/SnackbarTexts';
import { ParentComponent } from '../components/parent.component';
import { NoChangesMadeError } from '../common/error-handling/no-changes-made-error';

@Component({
    selector: 'notification-dialog',
    templateUrl: './notification.dialog.html',
})
export class NotificationDialogComponent extends ParentComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<NotificationDialogComponent>,
        protected paramService: ParamService,
        protected authService: AuthService,
        protected snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        super ( snackBar)
    }


    ngOnInit() {
    }

    onSubscribe(): void {

    }

    onUnSubscribe(): void {
        
    }


}
