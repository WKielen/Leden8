import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SignInDialogComponent } from 'src/app/my-pages/sign-in/sign-in.dialog'
import { MatDialog } from '@angular/material';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConfigDialogComponent } from 'src/app/app-nav/headerconfigdialog/config.dialog';
import { NotificationDialogComponent } from 'src/app/app-nav/headernotificationdialog/notification.dialog';
import { LogonData } from 'src/app/shared/classes/LogonData';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Output() toggleSideBarForMe: EventEmitter<any> = new EventEmitter();
  @Output() logonStatusToSideBar: EventEmitter<any> = new EventEmitter();

  logonData: LogonData = new LogonData;
  test = !environment.production;

  constructor(
    private router: Router,
    private authService: AuthService,
    public signinDialog: MatDialog,
    public configDialog: MatDialog
  ) {
  }

  ngOnInit() {
    this.setUserInfo();
  }

  toggleSideBar() {
    this.toggleSideBarForMe.emit();
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  changeLogonStatus(logonData: LogonData) {
    this.logonStatusToSideBar.emit(logonData);
  }



  /* Een pop-up signinDialog heeft een witte rand waardoor de opmaak niet netjes is. Voeg onderstaande toe aan styles.css */
  // .custom-signinDialog-container .mat-signinDialog-container {
  //   padding: 0px !important;
  //   border-radius: 6px;
  // }
  openSigninDialog(): void {
    const dialogRef = this.signinDialog.open(SignInDialogComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {  // in case of cancel the result will be false
        this.setUserInfo();
        this.logonData.IsLoggedOn = true;
        this.logonData.ShouldDisplayMenu = true;
        this.changeLogonStatus(this.logonData);
      }
    });
  }

  onSignOff(): void {
    this.authService.logOff();
    this.router.navigate([environment.homePage]);
    this.logonData.IsLoggedOn = false;
    this.logonData.ShouldDisplayMenu = false;
    this.changeLogonStatus(this.logonData);
  }

  onConfig(): void {
    this.configDialog.open(ConfigDialogComponent, {
      panelClass: 'custom-dialog-container', width: '800px',
      data: {}
    })
  }

  onNotification(): void {
    this.configDialog.open(NotificationDialogComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: {}
    })
  }

  setUserInfo(): void {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.fullName;
    this.logonData.UserId = this.authService.userId;
  }

}
