import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeComponent } from './../my-pages/home/home.component';

import { LedenComponent } from './../my-pages/leden/leden.component';
import { LedenManagerComponent } from './../my-pages/ledenmanager/ledenmanager.component';
import { MailComponent } from './../my-pages/mail/mail.component';
import { AgendaComponent } from './../my-pages/agenda/agenda.component';
import { WebsiteComponent } from './../my-pages/website/website.component';
import { LadderComponent } from './../my-pages/ladder/ladder.component';
import { MultiUpdateComponent } from './../my-pages/multi-update/multi-update.component';
import { DownloadComponent } from './../my-pages/download/download.component';
import { ContrBedragenComponent } from './../my-pages/contr-bedragen/contr-bedragen.component';
import { OudLedenComponent } from './../my-pages/oud-leden/oud-leden.component';
import { UsersComponent } from './../my-pages/users/users.component';
import { SyncNttbComponent } from './../my-pages/syncnttb/syncnttb.component';
import { TrainingDeelnameComponent } from './../my-pages/trainingdeelname/trainingdeelname.component';
import { TrainingOverzichtComponent } from './../my-pages/trainingoverzicht/trainingoverzicht.component';
import { TestComponent } from './../my-pages/test/test.component';

import { AgendaDialogComponent } from './../my-pages/agenda/agenda.dialog';
import { LedenDialogComponent } from './../my-pages/ledenmanager/ledenmanager.dialog';
import { LedenDeleteDialogComponent } from './../my-pages/ledenmanager/ledendelete.dialog';
import { MailDialogComponent } from './../my-pages/mail/mail.dialog';
import { RolesDialogComponent } from './../my-pages/users/roles.dialog';
import { SignInDialogComponent } from './../my-pages/sign-in/sign-in.dialog';
import { SingleMailDialogComponent } from './../my-pages/mail/singlemail.dialog';
import { TrainingOverzichtDialogComponent } from './../my-pages/trainingoverzicht/trainingoverzicht.dialog';
import { WebsiteDialogComponent } from './../my-pages/website/website.dialog';

import { SelectLidDropdownComponent } from '../shared/components/select.lid.dropdown.component';
import { CheckboxListComponent } from '../shared/components/checkbox.list.component';
import { ParentComponent } from '../shared/components/parent.component';
import { CustomMaterialModule } from '../material.module';
import { FlexLayoutModule } from '@angular/flex-layout';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LayoutModule } from '@angular/cdk/layout';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    HomeComponent,
    LedenComponent,
    LedenManagerComponent,
    MailComponent,
    AgendaComponent,
    WebsiteComponent,
    LadderComponent,
    MultiUpdateComponent,
    DownloadComponent,
    ContrBedragenComponent,
    OudLedenComponent,
    UsersComponent,
    SyncNttbComponent,
    TrainingDeelnameComponent,
    TrainingOverzichtComponent,
    TestComponent,

    AgendaDialogComponent,
    LedenDialogComponent,
    LedenDeleteDialogComponent,
    MailDialogComponent,
    RolesDialogComponent,
    SignInDialogComponent,
    SingleMailDialogComponent,
    TrainingOverzichtDialogComponent,  
    WebsiteDialogComponent,

    SelectLidDropdownComponent,
    CheckboxListComponent,
    ParentComponent,

  ],
  imports: [
    CommonModule,
    CustomMaterialModule,
    FlexLayoutModule,
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    LayoutModule,
    HttpClientModule,
    // AngularIbanModule,
  ],
  // exports: [
  //   HomeComponent,
  //   LedenComponent,
  //   LedenManagerComponent,
  //   MailComponent,
  //   AgendaComponent,
  //   WebsiteComponent,
  //   LadderComponent,
  //   MultiUpdateComponent,
  //   DownloadComponent,
  //   ContrBedragenComponent,
  //   OudLedenComponent,
  //   UsersComponent,
  //   SyncNttbComponent,
  //   TrainingDeelnameComponent,
  //   TrainingOverzichtComponent,
  //   TestComponent,

  //   AgendaDialogComponent,
  //   LedenDialogComponent,
  //   LedenDeleteDialogComponent,
  //   MailDialogComponent,
  //   RolesDialogComponent,
  //   SignInDialogComponent,
  //   SingleMailDialogComponent,
  //   TrainingOverzichtDialogComponent,  
  //   WebsiteDialogComponent,

  //   SelectLidDropdownComponent,
  //   CheckboxListComponent,
  //   ParentComponent,

  // ]
})
export class MyPagesModule { }
