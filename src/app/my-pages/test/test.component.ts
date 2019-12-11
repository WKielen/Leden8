import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AppError } from 'src/app/common/error-handling/app-error';
import { MailService } from 'src/app/services/mail.service';
import { AuthService } from 'src/app/services/auth.service';
import { SwPush } from '@angular/service-worker';
import { NotificationService, NotificationRecord } from 'src/app/services/notification.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  VAPID_PUBLIC_KEY: string = 'BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw';
  token: any;

  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private swPush: SwPush,
    protected snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    /***************************************************************************************************
  / Als we zijn ingelogd dan komt er een pop-up of we notificaties mogen ontvangen.
  /***************************************************************************************************/
    if (this.authService.isLoggedIn) {
      console.log('We zijn ingelogd en in ngOnit');
      this.subscribeToNotifications();
    }
  }

  public subscribeToNotifications(): void {
    this.swPush.requestSubscription({
      serverPublicKey: this.VAPID_PUBLIC_KEY
    })
      .then(sub => {
        this.token = JSON.stringify(sub);
        let notificationRecord = new NotificationRecord();
        notificationRecord.UserId = this.authService.userId;
        notificationRecord.Token = btoa(JSON.stringify(this.token));
        this.notificationService.create$(notificationRecord).subscribe()
        console.log('subscribe', sub, JSON.stringify(sub))
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
  }

  public onSendNotifications() {
    let audiance: Array<string> = ['AD'];
    this.notificationService.sendNotifications(audiance, 'Dit is mijn bericht');
  }
}
