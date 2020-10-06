import { Component, OnInit, OnDestroy, ViewChild, AfterViewChecked } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { ParentComponent } from "src/app/shared/components/parent.component";
import { Calendar, CalendarOptions, DateSelectArg, EventApi, EventClickArg, EventInput, FullCalendarComponent } from "@fullcalendar/angular";
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { MatDialog } from "@angular/material/dialog";
import { AgendaDialogComponent } from "../agenda/agenda.dialog";
import { AgendaDetailDialogComponent } from "../agenda/agenda.detail.dialog";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { AppError } from "src/app/shared/error-handling/app-error";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { NotFoundError } from "src/app/shared/error-handling/not-found-error";
import { addHolidaysToEvents, agendaToEvent, setEventProps } from "../agenda/event-utils";
import { EventDropArg } from "@fullcalendar/interaction";

// TODO:
//  Select Multiple dates into vakantie

@Component({
  selector: "app-agenda",
  templateUrl: "./agenda.component.html",
  styleUrls: ["./agenda.component.scss"],
})
export class AgendaComponent
  extends ParentComponent
  implements OnInit, OnDestroy, AfterViewChecked {
  constructor(
    private agendaService: AgendaService,
    public authService: AuthService,
    public dialog: MatDialog,
    protected snackBar: MatSnackBar
  ) {
    super(snackBar);
  }

  private events: EventInput[] = [];
  private calendarApi: Calendar;
  @ViewChild('calendar') calendarComponent: FullCalendarComponent;

  /***************************************************************************************************
  / Lees agenda in en voeg deze toe aan de options object
  /***************************************************************************************************/
  ngOnInit() {
    if (this.authService.isMobile) {
      this.calendarOptions.initialView = "listMonth";
    }

    this.registerSubscription(
      this.agendaService
        .getAll$()
        .subscribe((agendaLijst: Array<AgendaItem>) => {
          agendaLijst.forEach((item) => {
            this.events.push(agendaToEvent(item));
          });
          this.calendarOptions.events = this.events;
        })
    );
    // De vakanties toevoegen aan de events array
    this.events = this.events.concat(addHolidaysToEvents());
  }

  // Voor deze lifecycle hook is the calendar component nog niet geinitialiseerd.
  ngAfterViewChecked() {
    this.calendarApi = this.calendarComponent.getApi();
  }

  /***************************************************************************************************
  / De opties om de calendar te formatteren.
  /***************************************************************************************************/
  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    firstDay: 1,
    height: "100%",
    weekNumbers: true,
    weekText: "",
    locale: "nl",

    headerToolbar: {
      left: "prev,next today",
      center: "title",
      right: "dayGridMonth,listMonth",
    },
    buttonText: { month: "maand", list: "lijst", today: "vandaag" },
    selectable: true, // Allows a user to highlight multiple days or timeslots by clicking and dragging.
    displayEventTime: false,
    titleFormat: { year: "numeric", month: "short" },
    // initialEvents: this.events, // alternatively, use the `events` setting to fetch from a feed
    weekends: true,
    editable: true,
    selectMirror: false, // This option only applies to the TimeGrid views.
    dayMaxEvents: true,
    // See www.fullcalendar.io for all posible events
    select: this.onDateClick.bind(this), //Add
    eventClick: this.onEventClick.bind(this), // Change
    eventDrop: this.onEventDrop.bind(this), // dragdrop
  };

  /***************************************************************************************************
  / TOEVOEGEN: Er is op een datum geklikt
  /***************************************************************************************************/
  public onDateClick(selectInfo: DateSelectArg): void {
    let toBeAdded: AgendaItem = new AgendaItem();
    // Defaults
    toBeAdded.Datum = selectInfo.startStr;
    toBeAdded.Type = "T";
    toBeAdded.DoelGroep = "J";

    this.dialog
      .open(AgendaDialogComponent, {
        panelClass: "custom-dialog-container",
        width: "1200px",
        data: { method: "Toevoegen", data: toBeAdded },
      })
      .afterClosed() // returns an observable
      .subscribe((result) => {
        if (result) {
          this.storeResults(null, { 'method': 'Toevoegen', 'data': result });
        }
      });
  }

  /***************************************************************************************************
  / WIJZIGEN: Er is op een event geklikt
  /***************************************************************************************************/
  onEventClick(clickInfo: EventClickArg): void {
    this.dialog.open(AgendaDetailDialogComponent, {
      panelClass: 'detail-agenda-dialog-container',
      width: '500px',
      data: {
        method: "Wijzigen",
        data: clickInfo.event.extendedProps["agendaItem"],
      },
    })
      .afterClosed()
      .subscribe(result => {
        this.storeResults(clickInfo.event, result);
      });
  }

  /***************************************************************************************************
  / DRAG/DROP: Als er een drag/drop heeft plaatsgevonden dan bewaren we het aangepaste record.
  /***************************************************************************************************/
  onEventDrop(args: EventDropArg) {
    // De datum in 'ons' agendaItem record moet worden aangepast voordat we het record opslaan.
    args.event.extendedProps["agendaItem"].Datum = args.event.startStr;
    this.storeResults(args.event, { 'method': 'Wijzigen', 'data': args.event.extendedProps.agendaItem });
  }

  /***************************************************************************************************
  / Hier worden de Toevoegen/Wijziging/Verwijder in de Database doorgevoerd.
  /***************************************************************************************************/
  storeResults(event: EventApi, result: any): void {
    if (!result) return;
    console.log('result', result);
    let sub;
    switch (result.method) {
      case 'Verwijderen':
        sub = this.agendaService.delete$(event.id)
          .subscribe(data => {
            this.calendarApi.getEventById(event.id).remove();
            this.showSnackBar(SnackbarTexts.SuccessDelete);
          },
            (error: AppError) => {
              console.log('error', error);
              if (error instanceof NotFoundError) {
                this.showSnackBar(SnackbarTexts.NotFound);
              } else { throw error; } // global error handler
            }
          );
        this.registerSubscription(sub);
        break;
      case 'Toevoegen':
        sub = this.agendaService.create$(result.data).subscribe(
          (addResult: any) => {
            result.Id = addResult.Key.toString();
            this.calendarApi.unselect(); // clear date selection
            this.calendarApi.addEvent(agendaToEvent(result.data));
            this.showSnackBar(SnackbarTexts.SuccessNewRecord);
          },
          (error: AppError) => {
            if (error instanceof DuplicateKeyError) {
              this.showSnackBar(SnackbarTexts.DuplicateKey);
            } else {
              throw error;
            }
          }
        );
        this.registerSubscription(sub);
        break;

      case 'Wijzigen':
        sub = this.agendaService.update$(result.data).subscribe(
          (data) => {
            setEventProps(event, result.data);
            this.showSnackBar(SnackbarTexts.SuccessFulSaved);
          },
          (error: AppError) => {
            if (error instanceof NoChangesMadeError) {
              this.showSnackBar(SnackbarTexts.NoChanges);
            } else if (error instanceof NotFoundError) {
              this.showSnackBar(SnackbarTexts.NotFound);
            } else {
              throw error;
            }
          }
        );
        this.registerSubscription(sub);
        break;
    }
  }
}
