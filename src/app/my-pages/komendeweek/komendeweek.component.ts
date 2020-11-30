import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { map } from 'rxjs/internal/operators/map';
import { AgendaItem, AgendaService } from 'src/app/services/agenda.service';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { Dictionary } from 'src/app/shared/modules/Dictionary';
import * as moment from 'moment';

@Component({
  selector: 'app-komendeweek',
  templateUrl: './komendeweek.component.html',
  styleUrls: ['./komendeweek.component.scss']
})
export class KomendeWeekComponent extends ParentComponent implements OnInit {

  constructor(
    private agendaService: AgendaService,
    protected snackBar: MatSnackBar
  ) {
    super(snackBar);
  }
  dagen: Dictionary = new Dictionary([]);

  ngOnInit(): void {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    let uitersteDate = moment().add(7, 'days').toDate();
    this.registerSubscription(
      this.agendaService
        .getAllFromNow$()
        .pipe(
          map(function (value: AgendaItem[]) {
            let localdata: Array<AgendaItem> = []
            value.forEach(element => {
              let agendaDate = moment(element.Datum).toDate();
              if (agendaDate <= uitersteDate)
                localdata.push(element)
            });
            return localdata;
          })
        )
        .subscribe((agendaLijst: Array<AgendaItem>) => {
          agendaLijst.forEach(element => {
            let agendaDate: Date = moment(element.Datum).toDate();
            let dagnaam: string = agendaDate.toLocaleDateString('nl-NL', options)
            if (!this.dagen.containsKey(element.Datum)) {
              console.log('datum', dagnaam);
              this.dagen.add(dagnaam, []);
            }
            let dag: Array<AgendaItem> = this.dagen.get(dagnaam);
            dag.push(element);
          });
          console.log('', this.dagen);
        })
    );
  }

  xyz(): void {
    let v = this.dagen.getIndex(0);


  }


}

