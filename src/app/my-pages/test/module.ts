import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TestComponent } from './test.component';
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin
import interactionPlugin from '@fullcalendar/interaction'; // a plugin
import listPlugin from '@fullcalendar/list';
import { FullCalendarModule } from '@fullcalendar/angular'; // the main connector. must go first
import { A2hsComponent } from 'src/app/shared/components/a2hs/a2hs.component';

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin,
  interactionPlugin,
  listPlugin
]);

@NgModule({
  declarations: [
    TestComponent,
    A2hsComponent,
  ],
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: TestComponent
      }
    ]),
    CommonModule,
    FullCalendarModule
  ]
})

export class Module { }
