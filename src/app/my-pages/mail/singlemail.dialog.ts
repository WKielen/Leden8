import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { LedenItem } from 'src/app/services/leden.service';
import { ReadTextFileService } from 'src/app/services/readtextfile.service';
import { ReplaceKeywords } from 'src/app/shared/modules/ReplaceKeywords';
import { MailDialogComponent } from './mail.dialog';
import { ExternalMailApiRecord, MailItem } from 'src/app/services/mail.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
    selector: 'singlemail-dialog',
    templateUrl: './singlemail.dialog.html',
})
export class SingleMailDialogComponent implements OnInit {

    mailText: string = '';
    itemsToMail: Array<MailItem> = [];
    subject: string = '';

    editorConfig: AngularEditorConfig = {
        editable: true,
        spellcheck: true,
        height: 'auto',
        minHeight: '20',
        maxHeight: 'auto',
        // width: '800px',
        width: 'auto',
        minWidth: '0',
        translate: 'yes',
        enableToolbar: true,
        showToolbar: true,
        placeholder: 'Enter text here...',
        defaultParagraphSeparator: '',
        defaultFontName: '',
        defaultFontSize: '',
        fonts: [
            { class: 'arial', name: 'Arial' },
            { class: 'times-new-roman', name: 'Times New Roman' },
            { class: 'calibri', name: 'Calibri' },
            { class: 'comic-sans-ms', name: 'Comic Sans MS' }
        ],
        customClasses: [
            {
                name: 'quote',
                class: 'quote',
            },
            {
                name: 'redText',
                class: 'redText'
            },
            {
                name: 'titleText',
                class: 'titleText',
                tag: 'h1',
            },
        ],
        uploadUrl: 'v1/image',
        uploadWithCredentials: false,
        sanitize: true,
        toolbarPosition: 'top',
        toolbarHiddenButtons: [
            ['insertImage', 'insertVideo',
                'backgroundColor',
                'customClasses',
                'link',
                'unlink',

            ],
        ]
    };

    constructor(
        public dialogRef: MatDialogRef<SingleMailDialogComponent>,
        public readTextFileService: ReadTextFileService,
        private dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public singleMailInputDialog: SingleMail  // Dit is een interface
    ) { }

    ngOnInit(): void {
        this.readTextFileService.read(this.singleMailInputDialog.TemplatePathandName)
            .subscribe(data => {
                this.mailText = ReplaceKeywords(this.singleMailInputDialog.Lid, data);
            });
    }

    /***************************************************************************************************
    / Verstuur de email
    /***************************************************************************************************/
    onSendMail($event): void {
        let mailDialogInputMessage = new ExternalMailApiRecord();
        mailDialogInputMessage.MailItems = new Array<MailItem>();

        let mailAddresses: Array<string> = LedenItem.GetEmailList(this.singleMailInputDialog.Lid);
        mailAddresses.forEach(element => {
            let itemToMail = new MailItem();
            itemToMail.Message = this.mailText;
            itemToMail.Subject = this.singleMailInputDialog.Subject;
            itemToMail.To = element;
            mailDialogInputMessage.MailItems.push(itemToMail);
        });

        // console.log('data from sender', mailDialogInputMessage);
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
}

/***************************************************************************************************
/ De interface naar de SingleMail Dialog.
/***************************************************************************************************/
export class SingleMail {
    Lid: LedenItem;
    Subject: string;
    TemplatePathandName: string;
}