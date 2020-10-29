import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AgendaRoutingModule } from './agenda-routing.module';
import { AgendaComponent } from './agenda.component';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import listPlugin from '@fullcalendar/list';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import { ReactiveFormsModule } from '@angular/forms';
import { CustomMaterialModule } from 'src/app/material.module';
import { AgendaDialogComponent } from './agenda.dialog';
import { AgendaDetailDialogComponent } from './agenda.detail.dialog';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin
]);

@NgModule({
  declarations: [
    AgendaComponent,
    AgendaDialogComponent,
    AgendaDetailDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CustomMaterialModule,
    AgendaRoutingModule,
    FullCalendarModule
  ]
})
export class AgendaModule { }
