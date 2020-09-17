import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from 'src/app/services/param.service';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking

@Component({
  selector: 'app-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent extends ParentComponent implements OnInit, OnDestroy {

  constructor(
    protected snackBar: MatSnackBar,
    public authService: AuthService,
    public paramService: ParamService,
  ) {
    super(snackBar);
  }

  ngOnInit() {
  }

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    height: '100%',
    weekNumbers: true,
    weekText: 'Week ',
    locale: 'nl',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    eventClick: this.handleEventClick.bind(this),
    // select:this.handleSelect.bind(this),
    events: [
      { title: 'event 1', date: '2020-09-01' },
      {
        title: 'event 2', date: '2020-09-02',
        extendedProps: {
          status: 'done'
        }
      },
      {
        title: 'event 4', date: '2020-09-03',
        backgroundColor: 'green',
        borderColor: 'yellow'
      },
    ],
    headerToolbar: { start: 'title', center: 'today prev,next', end: 'dayGridWeek,dayGridMonth' },
    selectable: true,



  };
  listOptions: CalendarOptions = {
    initialView: 'listMonth',
    height: '100%',
    weekNumbers: true,
    weekText: 'Week ',
    locale: 'nl',
    dateClick: this.handleDateClick.bind(this), // bind is important!
    eventClick: this.handleEventClick.bind(this),
    events: [
      { title: 'event 1', date: '2020-09-01' },
      {
        title: 'event 2', date: '2020-09-02',
        extendedProps: {
          status: 'done'
        }
      },
      {
        title: 'event 4', date: '2020-09-03',
        backgroundColor: 'green',
        borderColor: 'yellow'
      },

    ]
  };
  handleDateClick(arg) {
    alert('date click! ' + arg.dateStr)
  }
  handleEventClick(arg) {
    alert('Event: ' + arg.event.title);
    alert('Coordinates: ' + arg.jsEvent.pageX + ',' + arg.jsEvent.pageY);
    alert('View: ' + arg.view.type);

    // change the border color just for fun
    arg.el.style.borderColor = 'red';
  }
  handleSelect(arg) {
    console.log(arg);
    alert('Begin: ' + arg.startStr);
  }


}
