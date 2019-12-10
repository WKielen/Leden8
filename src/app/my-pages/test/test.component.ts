import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { AppError } from 'src/app/common/error-handling/app-error';
import { MailService } from 'src/app/services/mail.service';
import { AuthService } from 'src/app/services/auth.service';
import { SwPush } from '@angular/service-worker';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {
  VAPID_PUBLIC_KEY: string = 'BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw';
  token: any;

  constructor(
    private mailService: MailService,
    private authService: AuthService,
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
      // .then(sub => this.newsletterService.addPushSubscriber(sub).subscribe())
      .then(sub => {
        this.token = JSON.stringify(sub);
        console.log('subscribe', sub, JSON.stringify(sub))
      })
      .catch(err => console.error("Could not subscribe to notifications", err));
  }


  public onSendNotification() {
    this.mailService.notification$({'sub_token':this.token})
      .subscribe(data => {
        let result = data as string;
        console.log('result van mailService', result, JSON.stringify(result));

      },
        (error: AppError) => {
          console.log("error", error);
        }
      );
  }
}
