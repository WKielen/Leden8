import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NotificationService, NotificationRecord } from 'src/app/services/notification.service';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/services/auth.service';
import * as moment from 'moment';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    readonly swPush: SwPush,
    protected snackBar: MatSnackBar,
    public authService: AuthService
  ) {
  }

  ngOnInit() {

    // als er in de browser op de notification wordt geclicked dan wordt dat hier opgevangen.
    this.swPush.notificationClicks.subscribe(arg => {
      console.log(
        'Action: ' + arg.action,
        'Notification data: ' + arg.notification.data,
        'Notification data.url: ' + arg.notification.data.url,
        'Notification data.body: ' + arg.notification.body,
        'arg: ' + arg,

      );
    });

}

  public onSendNotifications() {
    let audiance: Array<string> = ['AD'];
    let userids: Array<string> = ['3198048', '3198048']
    let dt = moment().toDate().toLocaleString();

    let titel = 'Bericht uit test';
    let bericht = 'Bericht voor rol AD ' + dt;
    console.log('Ik ga een testbericht versturen');
    console.log('Titel',titel);
    console.log('Message', bericht)
    

    this.notificationService.sendNotificationsForRole(['AD' ], titel, bericht);
  }

  // public onSendNotifications2() {
  //   this.notificationService.sendNotificationToUserId2('3198048', 'Rol message', 'Bericht voor rol AD');
  // }

  /***************************************************************************************************
  / Dit is een tweede manier om toestemming te vragen. Ik maak gebruik van de swpush lib die dit default doet.
  /***************************************************************************************************/
  onAskPermission() {
    return new Promise(function (resolve, reject) {
      const permissionResult = Notification.requestPermission(function (result) {
        resolve(result);
      });

      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
      .then(function (permissionResult) {
        if (permissionResult !== 'granted') {
          throw new Error('We weren\'t granted permission.');
        }
      });
  }

  async onRerequestSubscription1() {
    try {
      const sub = await this.swPush.requestSubscription({
        serverPublicKey: 'BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw',
      })
      console.log('sub', sub);

      // TODO: Send to server.
    } catch (err) {
      console.error('Could not subscribe due to:', err);
    }
  }


  private publicKey: string = '';
  onGetKey() {
    this.notificationService.getPublicKey$().subscribe(response => {
      this.publicKey = response as string;
      // console.log(response);
    });
  }

  onRegisterToken() {
    let notificationRecord = new NotificationRecord();
    notificationRecord.UserId = this.authService.userId;
    notificationRecord.Token = btoa(JSON.stringify("1"));
    let sub1 = this.notificationService.create$(notificationRecord).subscribe(response => {
      // console.log(response);
    });
  }
  onUnsubscribe() {
    this.notificationService.Unsubscribe$('3198048').subscribe(response => {
      // console.log(response);
    });
  }

  onGetallToken() {
    this.notificationService.getAll$().subscribe(response => {
      // console.log(response);
    })
      ;
  }




  subscribeToNotifications() {
    console.log('subscribeToNotifications');



    function notifyMe() {
      console.log('41');
      if (Notification.permission !== "granted") {
        console.log('5');
        Notification.requestPermission();
      } else {
        console.log('6');
        var notification = new Notification('Notification title', {
          icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
          body: "Hey there! You've been notified!",
        });
        console.log('7');
        notification.onclick = function () {
          console.log('8');
          window.open("http://stackoverflow.com/a/13328397/1269037");
        };

      }

    }
    notifyMe();


  }
}
















// public_key: BL9GfIZqFPcIyOnFTOXsrORJg-BwMYG00s6VZyqQcJbXvvVFjsv-RfUI0dy8g14wyKORTPcw4-nKywaaOGCfSRw
// private_key: o2pjY0wWgWSHZUJzhS59JZpY_TY9QItcRZgwUrw7_8I