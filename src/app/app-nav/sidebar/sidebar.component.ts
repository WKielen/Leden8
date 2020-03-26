import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ROUTE, PAGEROLES } from 'src/app/shared/classes/Page-Role-Variables';
import { AuthService } from './../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})

export class SidebarComponent implements OnInit {

  // We gebruiken de 'isHandset' om te bepalen of het een mobiel is. Als het een mobiel is dan
  // sluiten we het menu direct nadat er een menu-item is gekozen.
  @Input('isHandset') isHandset: boolean;

  // Deze output wordt gebruikt om in de default component het menu te sluiten.
  @Output() displaySideBar: EventEmitter<any> = new EventEmitter();

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
  routeDashboard = ROUTE.dashboardPageRoute;
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

  // Wordt gebruikt om de naam te tonen bovenaan het menu
  name = this.authService.fullName;

  constructor(
    private authService: AuthService,
    private router: Router,

  ) { }

  ngOnInit() {
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
  }
  // Op de mobiel wordt het menu automatisch gesloten wanneer en een keuze is gemaakt.
  route(myRoute: string): void {
    this.router.navigate([myRoute as any]);
    if (this.isHandset) {
      this.displaySideBar.emit(false);
    }
  }

}
