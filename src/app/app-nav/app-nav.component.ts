import { Component, ViewChild } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SignInDialogComponent } from '../my-pages/sign-in/sign-in.dialog';
import { MatDialog } from '@angular/material/dialog';
import { environment } from './../../environments/environment';
import { MatDrawer } from '@angular/material';
import { ROUTE, PAGEROLES } from 'src/app/common/classes/Page-Role-Variables';
import { ConfigDialogComponent } from './config.dialog';

@Component({
  selector: 'app-nav',
  templateUrl: './app-nav.component.html',
  styleUrls: ['./app-nav.component.css']
})
export class AppNavComponent {

  @ViewChild('drawer', {static: false}) drawer: MatDrawer;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => {
        this.isHandset = result.matches;
        return result.matches; })
    );

  userid = null;
  signoffPage = null;
  isLoggedIn: boolean;
  isVisable = true;
  isHandset = false;
  menuOpened = false;

  // Mag de optie in het menu worden getoond?
  showRouteLeden: boolean = false;
  showRouteLedenmanager: boolean = false;
  showRouteMail: boolean = false;
  showRouteAgenda: boolean = false;
  showRouteWebsite: boolean = false;
  showRouteLadder: boolean = false;
  showRouteMultiupdate: boolean = false;
  showRouteDownload: boolean = false;
  showRouteContrbedragen: boolean = false;
  showRouteOudleden: boolean = false;
  showRouteUsers: boolean = false;
  showRouteSyncNttb: boolean = false;
  showRouteTest: boolean = false;
  showRouteTrainingDeelname: boolean = false;
  showRouteTrainingOverzicht: boolean = false;

  // De routes naar de pagina's 
  routeLeden = ROUTE.ledenPageRoute;
  routeLedenmanager = ROUTE.ledenmanagerPageRoute;
  routeMail = ROUTE.mailPageRoute;
  routeAgenda = ROUTE.agendaPageRoute;
  routeWebsite = ROUTE.websitePageRoute;
  routeLadder = ROUTE.ladderPageRoute;
  routeMultiupdate = ROUTE.multiupdatePageRoute;
  routeDownload = ROUTE.downloadPageRoute;
  routeContrbedragen = ROUTE.contrbedragenPageRoute;
  routeOudleden = ROUTE.oudledenPageRoute;
  routeUsers = ROUTE.usersPageRoute;
  routeSyncNttb = ROUTE.syncnttbPageRoute;
  routeTest = ROUTE.testPageRoute;
  routeTrainingDeelname = ROUTE.trainingdeelnamePageRoute;
  routeTrainingOverzicht = ROUTE.trainingoverzichtPageRoute;
  
  routes = ROUTE;      

  constructor(private breakpointObserver: BreakpointObserver,
    private router: Router,
    private authService: AuthService,
    public signinDialog: MatDialog,
    public configDialog: MatDialog
    ) {
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
        this.menuOpened = true;
      }
    });
  }

  // Op de mobiel wordt het menu automatisch gesloten wanneer en een keuze is gemaakt.
  route(myRoute: string): void {
    this.router.navigate([myRoute as any]);
    if (this.isHandset) {
      this.drawer.close();
    }
  }

  onSignOff(): void {
    this.authService.logOff();
    this.router.navigate([environment.homePage]);
    this.isLoggedIn = false;
  }

  onConfig(): void {
    this.configDialog.open(ConfigDialogComponent, {
      panelClass: 'custom-dialog-container', width: '800px',
      data: {}
  })
  }



  setUserInfo(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.userid = this.authService.userId;

    this.showRouteLeden = this.authService.showRoute(PAGEROLES.ledenPageRoles);
    this.showRouteLedenmanager = this.authService.showRoute(PAGEROLES.ledenmanagerPageRoles);
    this.showRouteMail = this.authService.showRoute(PAGEROLES.mailPageRoles);
    this.showRouteAgenda = this.authService.showRoute(PAGEROLES.agendaPageRoles);
    this.showRouteWebsite = this.authService.showRoute(PAGEROLES.websitePageRoles);
    this.showRouteLadder = this.authService.showRoute(PAGEROLES.ladderPageRoles);
    this.showRouteMultiupdate = this.authService.showRoute(PAGEROLES.multiupdatePageRoles);
    this.showRouteDownload = this.authService.showRoute(PAGEROLES.downloadPageRoles);
    this.showRouteContrbedragen = this.authService.showRoute(PAGEROLES.contrbedragenPageRoles);
    this.showRouteOudleden = this.authService.showRoute(PAGEROLES.oudledenPageRoles);
    this.showRouteUsers = this.authService.showRoute(PAGEROLES.usersPageRoles);
    this.showRouteSyncNttb = this.authService.showRoute(PAGEROLES.syncnttbPageRoles);
    this.showRouteTest = this.authService.showRoute(PAGEROLES.testPageRoles);
    this.showRouteTrainingDeelname = this.authService.showRoute(PAGEROLES.trainingdeelnamePageRoles);
    this.showRouteTrainingOverzicht = this.authService.showRoute(PAGEROLES.trainingdeelnamePageRoles);

   // Eerst had ik *ngIf="authService.isRole('AD')" in de template staan. Angular is echter continu aan het renderen waardoor
    // method minimaal 10x per seconde werd aangeroepen. Veranderd en nu maak ik gebruik van een attribute.
  }

  /*
  ngOnInit(){
    console.log("app-nav", "ngOnInit");
  }

  ngOnCheck(){
      console.log("app-nav", "ngOnCheck");
  }

  ngOnChanges(){
    console.log("app-nav", "ngOnChanges");
  }
  ngAfterContentInit(){
    console.log("app-nav", "ngAfterContentInit");
  }
  ngAfterViewInit(){
    console.log("app-nav", "ngAfterViewInit");
  }
  ngAfterContentChecked(){
    console.log("app-nav", "ngAfterContentChecked");
  }
  ngAfterViewChecked(){
    console.log("app-nav", "ngAfterViewChecked");
  }
*/

}
