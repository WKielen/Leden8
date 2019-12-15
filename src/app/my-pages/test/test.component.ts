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
    this.notificationService.sendNotifications(audiance, 'Ledenadministratie','Dit is mijn bericht');
  }
}
