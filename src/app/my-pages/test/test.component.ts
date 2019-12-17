import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { NotificationService } from 'src/app/services/notification.service';
import { SwPush } from '@angular/service-worker';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    private router: Router,
    private swPush: SwPush,
    protected snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
    this.swPush.notificationClicks.subscribe( arg =>
      {
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
    let userids:Array<string> = ['3198048', '3198048']

    this.notificationService.sendNotificationsForRole(['AD'], 'Rol message', 'Bericht voor rol AD');

    //this.notificationService.sendNotificationToUserIds(userids, 'Ledenadministratie','Dit is mijn bericht');
  }

  /***************************************************************************************************
  / Dit is een tweede manier om toestemming te vragen. Ik maak gebruik van de swpush lib die dit default doet.
  /***************************************************************************************************/
    onAskPermission() {
    return new Promise(function(resolve, reject) {
      const permissionResult = Notification.requestPermission(function(result) {
        resolve(result);
      });
  
      if (permissionResult) {
        permissionResult.then(resolve, reject);
      }
    })
    .then(function(permissionResult) {
      if (permissionResult !== 'granted') {
        throw new Error('We weren\'t granted permission.');
      }
    });
  }

}
