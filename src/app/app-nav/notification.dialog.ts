import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { AppError } from '../common/error-handling/app-error';
import { ParentComponent } from '../components/parent.component';
import { SwPush } from '@angular/service-worker';
import { NotificationRecord, NotificationService } from '../services/notification.service';
import { NotFoundError } from '../common/error-handling/not-found-error';

@Component({
    selector: 'notification-dialog',
    templateUrl: './notification.dialog.html',
})
export class NotificationDialogComponent extends ParentComponent implements OnInit {

    VAPID_PUBLIC_KEY: string = 'BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw';

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
                // this.VAPID_PUBLIC_KEY = data as string; // todo zien waaom we een verkeerde sleutel krijden
            },
                (error: AppError) => {
                    this.showSnackBar('Controleer of mailserver aanwezig is!');
                });
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Hier vraag ik aan de service-worker om een abonnement op meldingen voor deze browser. Het abonnement
    / bevat een url naar de service-worker zelf. Dit abonnement sla ik op in de DB. Zodoende kan ik op een
    / later tijdstip een bericht sturen naar alle geregistreerde browsers
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
                            let audiance: Array<string> = ['AD'];
                            this.notificationService.sendNotifications(audiance, 'TTVN Nieuwegein', 'Je krijgt meldingen in deze browser');
                            this.showSnackBar('Aanmelding geregistreerd');
                        },
                            (error: AppError) => {
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
