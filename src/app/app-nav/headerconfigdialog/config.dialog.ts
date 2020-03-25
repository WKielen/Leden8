import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from 'src/app/services/param.service';
import { MailBoxParam } from '../../my-pages/mail/mail.component';
import { AppError } from '../../shared/error-handling/app-error';
import { NotFoundError } from '../../shared/error-handling/not-found-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';
import { SnackbarTexts } from '../../shared/error-handling/SnackbarTexts';
import { ParentComponent } from '../../shared/components/parent.component';
import { NoChangesMadeError } from '../../shared/error-handling/no-changes-made-error';

@Component({
    selector: 'config-dialog',
    templateUrl: './config.dialog.html',
})
export class ConfigDialogComponent extends ParentComponent implements OnInit {

    showPw: boolean = false;
    mailBoxParam = new MailBoxParam();

    mailboxparamForm = new FormGroup({
        ElecPostAddress: new FormControl(
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
        public dialogRef: MatDialogRef<ConfigDialogComponent>,
        protected paramService: ParamService,
        protected authService: AuthService,
        protected snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { 
        super ( snackBar)
    }


    ngOnInit() {
        this.readMailLoginData();
    }

    /***************************************************************************************************
    / Lees de mail box credetials uit de Param tabel
    /***************************************************************************************************/
    readMailLoginData(): void {
        this.paramService.readParamData$('mailboxparam' + this.authService.userId,
            JSON.stringify(new MailBoxParam()),
            'Om in te loggen in de mailbox')
            .subscribe(data => {
                let result = data as string;
                this.mailBoxParam = JSON.parse(result) as MailBoxParam;
                this.ElecPostAddress.setValue(this.mailBoxParam.UserId);
                this.EmailPassword.setValue(this.mailBoxParam.Password);
                this.EmailSender.setValue(this.mailBoxParam.Name);
            },
                (error: AppError) => {
                    console.log("error", error);
                }
            )
    }

/***************************************************************************************************
/ De SAVE knop van de email parameters zoals email, wachtwoord
/***************************************************************************************************/
    onSaveEmailParameters(): void {
        let mailBoxParam = new MailBoxParam();
        mailBoxParam.UserId = this.ElecPostAddress.value;
        mailBoxParam.Password = this.EmailPassword.value;
        mailBoxParam.Name = this.EmailSender.value;

        this.paramService.saveParamData$('mailboxparam' + this.authService.userId,
            JSON.stringify(mailBoxParam),
            'MailBoxParam' + this.authService.userId)
            .subscribe(data => {
                this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
            },
                (error: AppError) => {
                    if (error instanceof NotFoundError) {
                        this.showSnackBar(SnackbarTexts.NotFound, '');
                    }
                    else if (error instanceof DuplicateKeyError) {
                        this.showSnackBar(SnackbarTexts.DuplicateKey, '');

                    }
                    else if (error instanceof NoChangesMadeError) {
                        this.showSnackBar(SnackbarTexts.NoChanges, '');
                    }
                    else {
                        this.showSnackBar(SnackbarTexts.UpdateError, '');
                    }                    
                });
    }


    get ElecPostAddress() {
        return this.mailboxparamForm.get('ElecPostAddress');
    }
    get EmailPassword() {
        return this.mailboxparamForm.get('EmailPassword');
    }
    get EmailSender() {
        return this.mailboxparamForm.get('EmailSender');
    }
}
