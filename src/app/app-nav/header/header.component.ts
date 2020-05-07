import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { SignInDialogComponent } from 'src/app/my-pages/sign-in/sign-in.dialog'
import { MatDialog } from '@angular/material/dialog';
import { AuthService } from 'src/app/services/auth.service';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ConfigDialogComponent } from 'src/app/app-nav/headerconfigdialog/config.dialog';
import { NotificationDialogComponent } from 'src/app/app-nav/headernotificationdialog/notification.dialog';
import { LogonData } from 'src/app/shared/classes/LogonData';
import { A2hsService } from 'src/app/services/a2hs.service';
import { A2hsSafariHow2 } from 'src/app/shared/components/a2hs-ios-safari-how2/a2hs-ios-safari-how2';
import { A2hsComponent } from 'src/app/shared/components/a2hs/a2hs.component';

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
    public a2hs: A2hsService,
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
    this.router.navigate([environment.landingPage]);
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
    console.log ('Prompt Intercepted: ', this.a2hs.promptIntercepted);
    console.log ('Deferred Prompt Saved: ', this.a2hs.promptSaved);
    console.log ('Custom Button Clicked: ', this.a2hs.customButtonClicked);
    console.log ('Deferred Prompt Shown: ', this.a2hs.deferredPromptShown);
    console.log ('Deferred Prompt Rejected: ', this.a2hs.deferredPromptRejected);
    console.log ('App or Shortcut Added: ', this.a2hs.userInstalled);
    console.log ('isStandalone: ', this.a2hs.isStandalone);
    console.log ('isChrome: ', this.a2hs.isChrome);
    console.log ('isExplorer: ', this.a2hs.isExplorer);
    console.log ('isExplorer_11: ', this.a2hs.isExplorer_11);
    console.log ('isFirefox: ', this.a2hs.isFirefox);
    console.log ('isSafari: ', this.a2hs.isSafari);
    console.log ('isOpera: ', this.a2hs.isOpera);
    console.log ('isEdgeDesktop: ', this.a2hs.isEdgeDesktop);
    console.log ('isEdgeiOS: ', this.a2hs.isEdgeiOS);
    console.log ('isEdgeAndroid: ', this.a2hs.isEdgeAndroid);
    console.log ('isIOS: ', this.a2hs.isIOS);
    console.log ('isMobile: ', this.a2hs.isMobile);

    this.configDialog.open(A2hsComponent, {
      panelClass: 'custom-dialog-container', width: '400px',
      data: {}
    })
  }

  onIos(): void {
    this.configDialog.open(A2hsSafariHow2, {
      panelClass: 'custom-dialog-container',
      data: {}
    })
  }
  
  setUserInfo(): void {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.fullName;
    this.logonData.UserId = this.authService.userId;
  }

}
