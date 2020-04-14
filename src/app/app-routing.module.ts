import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from './services/auth.guard';
import { DashboardComponent } from './my-pages/dashboard/dashboard.component';
import { LedenComponent } from './my-pages/leden/leden.component';
import { LedenManagerComponent } from './my-pages/ledenmanager/ledenmanager.component';
import { AgendaComponent } from './my-pages/agenda/agenda.component';
import { UsersComponent } from './my-pages/users/users.component';
import { OudLedenComponent } from './my-pages/oud-leden/oud-leden.component';
import { DownloadComponent } from './my-pages/download/download.component';
import { AdminAuthGuard } from './services/admin-auth-guard.service';
import { HomeComponent } from './my-pages/home/home.component';
import { SignInDialogComponent } from './my-pages/sign-in/sign-in.dialog';
import { AgendaDialogComponent } from './my-pages/agenda/agenda.dialog';
import { WebsiteDialogComponent } from './my-pages/website/website.dialog';
import { MailDialogComponent } from './my-pages/mail/mail.dialog';
import { RolesDialogComponent } from './my-pages/users/roles.dialog';
import { OfflineComponent } from './my-pages/offline/offline.component';
import { LedenDialogComponent } from './my-pages/ledenmanager/ledenmanager.dialog';
import { LedenDeleteDialogComponent } from './my-pages/ledenmanager/ledendelete.dialog';
import { MultiUpdateComponent } from './my-pages/multi-update/multi-update.component';
import { ContrBedragenComponent } from './my-pages/contr-bedragen/contr-bedragen.component';
import { MailComponent } from './my-pages/mail/mail.component';
import { WebsiteComponent } from './my-pages/website/website.component';
import { LadderComponent } from './my-pages/ladder/ladder.component';
import { PAGEROLES, ROUTE } from 'src/app/shared/classes/Page-Role-Variables';
import { ConfigDialogComponent } from './app-nav/headerconfigdialog/config.dialog';
import { SingleMailDialogComponent } from './my-pages/mail/singlemail.dialog';
import { SyncNttbComponent } from './my-pages/syncnttb/syncnttb.component';
import { TrainingDeelnameComponent } from './my-pages/trainingdeelname/trainingdeelname.component';
import { TrainingOverzichtDialogComponent } from './my-pages/trainingoverzicht/trainingoverzicht.dialog';
import { TrainingOverzichtComponent } from './my-pages/trainingoverzicht/trainingoverzicht.component';
import { NotificationDialogComponent } from './app-nav/headernotificationdialog/notification.dialog';
import { DefaultComponent } from './app-nav/default/default.component';
import { TestComponent } from './my-pages/test/test.component';

const routes: Routes = [
  {
    path: '',
    component: DefaultComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: ROUTE.landingPageRoute, component: HomeComponent },
      { path: ROUTE.dashboardPageRoute, component: DashboardComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.dashboardPageRoute } },
      { path: ROUTE.ledenPageRoute, component: LedenComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.ledenPageRoles } },
      { path: ROUTE.ledenmanagerPageRoute, component: LedenManagerComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.ledenmanagerPageRoles } },
      { path: ROUTE.mailPageRoute, component: MailComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.mailPageRoles } },
      { path: ROUTE.agendaPageRoute, component: AgendaComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.agendaPageRoles } },
      { path: ROUTE.websitePageRoute, component: WebsiteComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.websitePageRoles } },
      { path: ROUTE.multiupdatePageRoute, component: MultiUpdateComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.multiupdatePageRoles } },
      { path: ROUTE.downloadPageRoute, component: DownloadComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.downloadPageRoles } },
      { path: ROUTE.oudledenPageRoute, component: OudLedenComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.oudledenPageRoles } },
      { path: ROUTE.contrbedragenPageRoute, component: ContrBedragenComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.contrbedragenPageRoles } },
      { path: ROUTE.usersPageRoute, component: UsersComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.usersPageRoles } },
      { path: ROUTE.ladderPageRoute, component: LadderComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.ladderPageRoles } },
      { path: ROUTE.syncnttbPageRoute, component: SyncNttbComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.syncnttbPageRoles } },
      { path: ROUTE.trainingdeelnamePageRoute, component: TrainingDeelnameComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.trainingdeelnamePageRoles } },
      { path: ROUTE.trainingoverzichtPageRoute, component: TrainingOverzichtComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.trainingdeelnamePageRoles } },
      { path: ROUTE.testPageRoute, component: TestComponent, canActivate: [AuthGuard, AdminAuthGuard], data: { roles: PAGEROLES.testPageRoles } },
      { path: ROUTE.offlinePageRoute, component: OfflineComponent },
      { path: '**', component: HomeComponent }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  // entryComponents: [SignInDialogComponent, AgendaDialogComponent, WebsiteDialogComponent,
  //   MailDialogComponent, LedenDialogComponent, LedenDeleteDialogComponent,
  //   RolesDialogComponent, ConfigDialogComponent, SingleMailDialogComponent,
  //   TrainingOverzichtDialogComponent, NotificationDialogComponent,
  // ],  not needed in angular 9 anymore
  declarations: [OfflineComponent],
})

export class AppRoutingModule { }
