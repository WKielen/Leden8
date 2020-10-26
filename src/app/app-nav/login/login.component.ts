import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SignInDialogComponent } from 'src/app/app-nav/sign-in/sign-in.dialog';
import { AuthService } from 'src/app/services/auth.service';
import { LogonData } from 'src/app/shared/classes/LogonData';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  logonData: LogonData = new LogonData;

  constructor(
    private authService: AuthService,
    public signinDialog: MatDialog,
  ) { }

  ngOnInit(): void {
//todo token weggooiren


    this.setUserInfo();
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
        // this.logonData.IsLoggedOn = true;
        // this.logonData.ShouldDisplayMenu = true;
        // this.changeLogonStatus(this.logonData);
      }
    });
  }

  setUserInfo(): void {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.fullName;
    this.logonData.UserId = this.authService.userId;
  }
}
