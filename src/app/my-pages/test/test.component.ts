import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { ParentComponent } from "src/app/shared/components/parent.component";
import {
  FullCalendarComponent,
  CalendarOptions,
  Calendar,
  EventInput,
  EventApi,
  EventSourceInput,
} from "@fullcalendar/angular"; // useful for typechecking
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { MatDialog } from "@angular/material/dialog";
import { AgendaDialogComponent } from "../agenda/agenda.dialog";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { AppError } from "src/app/shared/error-handling/app-error";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { NotFoundError } from "src/app/shared/error-handling/not-found-error";
import { Dictionary } from "src/app/shared/modules/Dictionary";

@Component({
  selector: "app-test",
  templateUrl: "./test.component.html",
  styleUrls: ["./test.component.scss"],
})
export class TestComponent
  extends ParentComponent
  implements OnInit, OnDestroy {
  constructor(
    protected snackBar: MatSnackBar,
    public authService: AuthService,
    public dialog: MatDialog,
    private agendaService: AgendaService
  ) {
    super(snackBar);
  }

  @ViewChild("calendar") calendarComponent: FullCalendarComponent;

  private agendaLijst: Array<AgendaItem> = [];
  public calendar: Calendar;
  private eventDict: Dictionary = new Dictionary([]);

  /***************************************************************************************************
  / Lees agenda in en voeg deze toe aan de options object
  /***************************************************************************************************/
  ngOnInit() {
    let events: Array<any> = [];
    this.registerSubscription(
      this.agendaService.getAll$().subscribe((data: Array<AgendaItem>) => {
        this.agendaLijst = data;
        this.agendaLijst.forEach((item) => {
          events.push(this.agendaToEvent(item));
        });
        this.calendarOptions.events = events;
      })
    );
  }

  /***************************************************************************************************
  / Transformeer een Agendaitem naar een event dat aan het Calendar object kan worden toegevoegd.
  / Het AngendaItem object zelf zit in de ExtendedProps
  /***************************************************************************************************/
  private agendaToEvent(item: AgendaItem): any {
    let event: any = new Object();
    event.title = item.EvenementNaam;
    event.date = item.Datum;

    // Als je start gebruikt dat krijg je een punt te zien met de begintijd. Als je het niet gebruikt dan
    // krijgen we een 'allDay' te zien. Dus een gekleurde achtergrond.
    //event.start = item.Datum + 'T'+ item.Tijd;
    event.id = item.Id;
    if (item.DoelGroep == "J") event.borderColor = "black";
    else event.borderColor = "orange";

    switch (item.Extra1) {
      case "0":
        event.backgroundColor = "orange";
        break;
      case "1":
        event.backgroundColor = "blue";
        break;
      case "2":
        event.backgroundColor = "yellow";
        event.textColor = "black";
        break;
      case "3":
        event.backgroundColor = "gray";
        event.textColor = "black";
        break;
    }
    event.extendedProps = item;
    return event;
  }

  /***************************************************************************************************
  / Er is op een datum geklikt. 
  /***************************************************************************************************/
  public handleDateClick(arg) {
    let tmp;
    let toBeAdded: AgendaItem = new AgendaItem();
    toBeAdded.Datum = arg.dateStr;

    this.dialog
      .open(AgendaDialogComponent, {
        panelClass: "custom-dialog-container",
        width: "1200px",
        data: { method: "Toevoegen", data: toBeAdded },
      })
      .afterClosed() // returns an observable
      .subscribe((result) => {
        if (result) {
          // in case of cancel the result will be false
          let sub = this.agendaService.create$(result).subscribe(
            (addResult) => {
              tmp = addResult;
              result.Id = tmp.Key;
              console.log(result);
              // Een beetje ingewikkeld om een event toe te voegen
              this.calendarComponent
                .getApi()
                .addEvent(this.agendaToEvent(toBeAdded));
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
        }
      });
  }

  /***************************************************************************************************
/ Er is op een event geklikt dus een update.
/***************************************************************************************************/
  handleEventClick(arg) {
    console.log("event", arg.event);
    arg.el.style.borderColor = "red";

    // Een deep copy
    let toBeEdited: AgendaItem = JSON.parse(
      JSON.stringify(arg.event.extendedProps)
    );

    const dialogRef = this.dialog.open(AgendaDialogComponent, {
      panelClass: "custom-dialog-container",
      width: "1200px",
      data: { method: "Wijzigen", data: toBeEdited },
    });

    dialogRef.afterClosed().subscribe((result: AgendaItem) => {
      if (result) {
        // in case of cancel the result will be false
        let sub = this.agendaService.update$(result).subscribe(
          (data) => {
            this.calendarComponent.getApi().getEventById(result.Id).remove();
            this.calendarComponent
              .getApi()
              .addEvent(JSON.parse(JSON.stringify(this.agendaToEvent(result))));

            //hier de ngenda aanpassem
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
      }
    });
  }

  handleSelect(arg) {
    console.log(arg);
  }

  calendarOptions: CalendarOptions = {
    initialView: "dayGridMonth",
    firstDay: 1,
    height: "100%",
    weekNumbers: true,
    weekText: "Week ",
    locale: "nl",
    eventClick: this.handleEventClick.bind(this),
    dateClick: this.handleDateClick.bind(this), // bind is important!
    select: this.handleSelect.bind(this),
    headerToolbar: {
      start: "title",
      center: "today prev,next",
      end: "dayGridWeek,dayGridMonth,listMonth",
    },
    buttonText: { month: "maand", list: "lijst", today: "vandaag" },
    selectable: true,
  };
}
