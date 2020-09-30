import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { AuthService } from "src/app/services/auth.service";
import { ParentComponent } from "src/app/shared/components/parent.component";
import { CalendarOptions, ToolbarInput } from "@fullcalendar/angular"; // useful for typechecking
import { AgendaItem, AgendaService } from "src/app/services/agenda.service";
import { MatDialog } from "@angular/material/dialog";
import { AgendaDialogComponent } from "../agenda/agenda.dialog";
import { SnackbarTexts } from "src/app/shared/error-handling/SnackbarTexts";
import { AppError } from "src/app/shared/error-handling/app-error";
import { DuplicateKeyError } from "src/app/shared/error-handling/duplicate-key-error";
import { NoChangesMadeError } from "src/app/shared/error-handling/no-changes-made-error";
import { NotFoundError } from "src/app/shared/error-handling/not-found-error";
import { Dictionary } from "src/app/shared/modules/Dictionary";

// TODO:
//  Drag and drop
//  Delete
//  Select Multiple dates

@Component({
    selector: 'app-agenda',
    templateUrl: './agenda.component.html',
    styleUrls: ['./agenda.component.scss'],
})

export class AgendaComponent
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

  private agendaLijst: Array<AgendaItem> = [];
  private eventDict: Dictionary = new Dictionary([]);
  private holiday = [
    ["herfst", "2020-10-17", "2020-10-26"],
    ["kerst", "2020-12-19", "2021-01-04"],
    ["voorjaar", "2021-02-20", "2021-03-01"],
    ["mei", "2021-05-01", "2021-05-10"],
    ["zomer", "2021-07-17", "2021-08-30"],

    ["herfst", "2021-10-16", "2021-10-25"],
    ["kerst", "2021-12-25", "2022-01-10"],
    ["voorjaar", "2022-02-26", "2022-03-07"],
    ["mei", "2022-04-30", "2022-05-09"],
    ["zomer", "2022-07-09", "2022-08-22"],

    ["herfst", "2022-10-22", "2022-10-31"],
    ["kerst", "2022-12-24", "2023-01-09"],
    ["voorjaar", "2023-02-25", "2023-03-06"],
    ["mei", "2023-04-29", "2023-05-08"],
    ["zomer", "2023-07-08", "2023-08-21"],

    ["herfst", "2023-10-14", "2023-10-23"],
    ["kerst", "2023-12-23", "2024-01-08"],
    ["voorjaar", "2024-02-17", "2024-02-25"],
    ["mei", "2024-04-27", "2024-05-06"],
    ["zomer", "2024-07-13", "2024-08-26"],

  ];

  /***************************************************************************************************
  / Lees agenda in en voeg deze toe aan de options object
  /***************************************************************************************************/
  ngOnInit() {
    if (this.authService.isMobile) {
      this.calendarOptions.initialView = 'listMonth';
      let tbi:ToolbarInput = new Object();
      tbi.start = 'title';
      tbi.center = 'prev,next';
      tbi.end = 'dayGridMonth,listMonth';
      this.calendarOptions.headerToolbar = tbi;
    }
    this.addHolidaysToDict();
    this.registerSubscription(
      this.agendaService.getAll$().subscribe((data: Array<AgendaItem>) => {
        this.agendaLijst = data;
        this.agendaLijst.forEach((item) => {
          this.eventDict.add(item.Id, this.agendaToEvent(item));
        });
        this.calendarOptions.events = this.eventDict.values();
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
  public onDateClick(arg: any): void {
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
              result.Id = tmp.Key.toString();
              // deepChangeDetection="true" have to be set in HTML to get this working
              this.eventDict.add(
                result.Id,
                this.agendaToEvent(JSON.parse(JSON.stringify(result)))
              );
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
  onEventClick(arg: any): void {
    // arg.el.style.borderColor = "red";

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
            // deepChangeDetection="true" have to be set in HTML to get this working
            this.eventDict.set(result.Id, this.agendaToEvent(result));
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

  /***************************************************************************************************
  / Als er meerdere datum worden geselecteerd
  /***************************************************************************************************/
  onSelect(arg) {
    console.log(arg);
    alert("not implemented yet");
  }

  /***************************************************************************************************
  / Voeg de vakanties toe aan de kalender 
  /***************************************************************************************************/
  addHolidaysToDict() {
    this.holiday.forEach((element) => {
      let aHoliday: any = new Object();
      aHoliday.title = element[0];
      aHoliday.start = element[1];
      aHoliday.end = element[2];
      aHoliday.display = "background";
      aHoliday.backgroundColor = "yellow";
      this.eventDict.add(aHoliday.title + aHoliday.start, aHoliday);
    });
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
    eventClick: this.onEventClick.bind(this),
    dateClick: this.onDateClick.bind(this), // bind is important!
    // select: this.onSelect.bind(this),
    headerToolbar: {
      start: "title",
      center: "today prev,next",
      end: "dayGridWeek,dayGridMonth,listMonth",
    },
    buttonText: { month: "maand", list: "lijst", today: "vandaag" },
    selectable: true,
    displayEventTime: false
  };
}
