import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(
    private notificationService: NotificationService,
    protected snackBar: MatSnackBar,
  ) {
  }

  ngOnInit() {
  }

  public onSendNotifications() {
    let audiance: Array<string> = ['AD'];
    let userids:Array<string> = ['3198048', '3198048']

    this.notificationService.sendNotificationsForRole(['AD'], 'Rol message', 'Bericht voor rol AD');

    //this.notificationService.sendNotificationToUserIds(userids, 'Ledenadministratie','Dit is mijn bericht');
  }
}
