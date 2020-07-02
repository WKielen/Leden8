import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SignInDialogComponent } from 'src/app/my-pages/sign-in/sign-in.dialog'
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { LogonData } from 'src/app/shared/classes/LogonData';

@Component({
  selector: 'app-header-landing',
  templateUrl: './header.landing.component.html',
  styleUrls: ['./header.landing.component.scss']
})
export class HeaderLandingComponent implements OnInit {

  @Output() logonStatusToSideBar: EventEmitter<any> = new EventEmitter();

  logonData: LogonData = new LogonData;

  constructor(
    // private router: Router,
    private authService: AuthService,
    public signinDialog: MatDialog,
  ) {
  }

  ngOnInit() {
    this.setUserInfo();
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

  setUserInfo(): void {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.fullName;
    this.logonData.UserId = this.authService.userId;
  }
}
