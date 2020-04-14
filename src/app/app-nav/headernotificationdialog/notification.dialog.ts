import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { AppError } from '../../shared/error-handling/app-error';
import { ParentComponent } from '../../shared/components/parent.component';
import { SwPush } from '@angular/service-worker';
import { NotificationRecord, NotificationService } from '../../services/notification.service';
import { NotFoundError } from '../../shared/error-handling/not-found-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';

@Component({
    selector: 'notification-dialog',
    templateUrl: './notification.dialog.html',
})
export class NotificationDialogComponent extends ParentComponent implements OnInit {

    VAPID_PUBLIC_KEY: string = '';
    //VAPID_PUBLIC_KEY: string = 'BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw';

    constructor(
        public dialogRef: MatDialogRef<NotificationDialogComponent>,
        protected snackBar: MatSnackBar,
        private swPush: SwPush,
        private notificationService: NotificationService,
        private authService: AuthService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        super(snackBar)
    }

    ngOnInit() {
        let sub = this.notificationService.GetPublicKey$()
            .subscribe(data => { // haal de sleutel uit de db. In mijn geval staat hij in de config.yml van de mailserver op de raspberry pi
                this.VAPID_PUBLIC_KEY = data as string;
            },
                (error: AppError) => {
                    this.showSnackBar('Controleer of mailserver aanwezig is!');
                });
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Hier vraag ik aan de service-worker om een abonnement op meldingen voor deze browser. Het abonnement
    / bevat een url naar de service-worker zelf. Dit abonnement sla ik op in de DB. Zodoende kan ik op een
    / later tijdstip een bericht sturen naar alle geregistreerde browsers.
    / Op de tabel in MySQL zit een index op het Token veld die aangeeft dat de waarde uniek moet zijn.
    / Als er 2x wordt geregistreerd, komt er een duplicate key error.
    /***************************************************************************************************/
    onSubscribe(): void {
        if (this.swPush.isEnabled) {
            this.swPush.requestSubscription({           // geeft een promise terug en geen obserable. Kan dus niet registereren
                serverPublicKey: this.VAPID_PUBLIC_KEY
            })
                .then(subscription => {
                    let notificationRecord = new NotificationRecord();
                    notificationRecord.UserId = this.authService.userId;
                    notificationRecord.Token = btoa(JSON.stringify(subscription));
                    let sub1 = this.notificationService.create$(notificationRecord)
                        .subscribe(data => {
                            this.notificationService.sendNotificationToUserId(notificationRecord.UserId, 'TTVN Nieuwegein', 'Je krijgt meldingen in deze browser');
                            this.showSnackBar('Aanmelding geregistreerd');
                        },
                            (error: AppError) => {
                                if (error instanceof DuplicateKeyError) {
                                    this.showSnackBar('Deze browser was al geregistreerd');
                                }                                
                                console.log("error", error);
                            }
                        )
                    this.registerSubscription(sub1);
                })
                .catch(err => console.error("Could not subscribe to notifications", err));
        } else {
            this.showSnackBar('Service Worker is not present', 'notification dialog: Service Worker not enabled');
        }
    }

    /***************************************************************************************************
    / Gooi alle subscribtions weg
    /***************************************************************************************************/
    onUnSubscribe(): void {
        let sub = this.notificationService.Unsubscribe(this.authService.userId)
            .subscribe(date => {
                this.showSnackBar('Ingeschakelde meldingen verwijderd');
             }, // is nodig om de error op te vangen
                (error: AppError) => {
                    if (error instanceof NotFoundError) {
                        this.showSnackBar('Je had geen meldingen ingeschakeld');
                    }
                });
        this.registerSubscription(sub);
    }
}
