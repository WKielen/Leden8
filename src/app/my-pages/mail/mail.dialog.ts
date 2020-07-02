import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { MailItem, MailService } from 'src/app/services/mail.service';
import { AppError } from 'src/app/shared/error-handling/app-error';
import { environment } from 'src/environments/environment';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { ServiceUnavailableError } from 'src/app/shared/error-handling/service-unavailable-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';

@Component({
    selector: 'app-mail-dialog',
    templateUrl: './mail.dialog.html',
})

export class MailDialogComponent extends ParentComponent {

    ckbTest: boolean = false;
    percentageComplete: number = 0;
    output: string = '';

    constructor(
        public dialogRef: MatDialogRef<MailDialogComponent>,
        private mailService: MailService,
        protected snackBar: MatSnackBar,
        @Inject(MAT_DIALOG_DATA)
        public dataFromCaller,  // wordt gevuld vanuit het component. Letop: geen type toevoegen
    ) {
        super(snackBar)
        console.log('data from caller', this.dataFromCaller);
    }

    /***************************************************************************************************
    / delayedForEach is een extensie op de foreach. Na iedere iteratie wordt er een periode gewacht.
    / Na alle iteraties wordt er nog een functie uitgevoerd.
    /***************************************************************************************************/
    onSendMail(): void {
        let mailWentOkay = true;
        this.dataFromCaller.MailItems.delayedForEach(function (item, idx, lijst) {
            // console.log(idx, lid, lijst);
            let result: boolean = this.processLid(item);
            if (!result) {
                mailWentOkay = false;
                console.log('mail result', result);
                
            }
            this.percentageComplete = (idx + 1) * 100 / this.dataFromCaller.MailItems.length;

        }, 1000, this,
            // Onderstaande functie wordt uitgevoerd wanneer de array doorlopen is. 
            // lijst param wordt niet gebruikt maar staat er als voorbeeld.
            function (context, lijst) {
                if (context.ckbTest) {
                    let dynamicDownload = new DynamicDownload();
                    dynamicDownload.dynamicDownloadTxt(context.output, 'My mails', 'txt');
                }

                if (mailWentOkay) {
                    context.showSnackBar('Mail verstuurd.');
                } else {
                    context.showSnackBar('Fout! Een of meerdere mails zijn niet verstuurd.');
                }

                setTimeout(function () {// na 3 sec sluit dialog automatisch
                    context.dataFromCaller.MailItems.clearTimeout();
                    context.dialogRef.close();
                }, 3000);

                console.log("done!");
            }
        );
    }

    /***************************************************************************************************
    / Als de test checkbox true is dan worden de mails in een tekst bestand geschreven
    / Anders worden de mails gewoon verstuurd.
    /***************************************************************************************************/
    processLid(mailItem: MailItem): boolean {
        let returnBoolean = true;

        if (this.ckbTest) {

            if (environment.production) {
                this.output += 'To: ' + mailItem.To + '\r\n';
            } else {
                this.output += 'To: wim_kielen@hotmail.com\r\n';
            }

            this.output += 'Subject: ' + mailItem.Subject + '\r\n';
            this.output += '\r\n';

            mailItem.Message.forEach(element => {
                this.output += element.replace('\n', '\r\n') + '\r\n';
            });
            this.output += "-----------------------------------------------------------------------------------------\r\n";
        }
        else {
            if (!environment.production) {
                mailItem.To = "wim_kielen@hotmail.com";
            }

            let mailItems = new Array<MailItem>();
            mailItems.push(mailItem);

            let sub = this.mailService.mail$(mailItems)
                .subscribe(data => {
                    let result = data as string;
                    console.log('result van mailService', result);

                },
                    (error: AppError) => {
                        returnBoolean = false;
                        console.log('error', error instanceof ServiceUnavailableError);

                        if (error instanceof ServiceUnavailableError) {
                            this.showSnackBar(SnackbarTexts.ServiceNotAvailable);
                        } else {
                            this.showSnackBar(SnackbarTexts.SevereError);
                        }
                    });
            this.registerSubscription(sub);
        }
        return returnBoolean;
    }

    /***************************************************************************************************
    / Cancel button pressed
    /***************************************************************************************************/
    onCancel(): void {
        this.dataFromCaller.MailItems.clearTimeout();
        this.dialogRef.close();
    }
}


