import { DoelgroepValues } from './../../services/agenda.service';
import { Component, OnInit } from '@angular/core';
import { AgendaService, TypeValues } from '../../services/agenda.service';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ParentComponent } from 'src/app/components/parent.component';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0', display: 'none' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class HomeComponent extends ParentComponent implements OnInit {

  constructor(
    protected snackBar: MatSnackBar,
    private agendaService: AgendaService) {
    super(snackBar)
  }

  public agendaDataArray?= null;
  public columnsToDisplay: string[] = ['Datum', 'EvenementNaam'];

  ngOnInit(): void {

    this.registerSubscription(
      this.agendaService.getAllFromNow$()
        .subscribe(data => {
          this.agendaDataArray = data;
        }));
  }

  /***************************************************************************************************
  / HTML helpers om de juiste tekst te tonen bij een variable
  /***************************************************************************************************/
  getType(value: string): string {
    return TypeValues.GetLabel(value);
  }
  getDoelgroep(value: string): string {
    return DoelgroepValues.GetLabel(value);
  }

}
