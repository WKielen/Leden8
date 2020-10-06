import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { tap, map, retry } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class AgendaService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/agenda', http);
  }

  /***************************************************************************************************
  / Alle agenda items vanaf vandaag
  /***************************************************************************************************/
  getAllFromNow$() : Observable<Array<AgendaItem>>{
    return this.http.get(environment.baseUrl + '/agenda/getallfromnow')
      .pipe(
        retry(3),
        tap( // Log the result or error
          data => console.log('Received: ', data),
          error => console.log('Oeps: ', error)
        ),
        map(function (value) {
          this.localdata = value;
          this.localdata.forEach(element => {
            delete element['ExtraA'];
            delete element['ExtraB'];
            delete element['DatumWijziging'];
          });
          return this.localdata;
        })
      );
  }

  /***************************************************************************************************
    // De ExtraA en ExtraB moeten uit de SQL tabel zelf worden verwijderd. Zodra dit is gebeurd kan deze override worden verwijderd.
  /***************************************************************************************************/
  update$(element): Observable<Object> {
    delete element['ExtraA'];
    delete element['ExtraB'];
    delete element['DatumWijziging'];
    return super.update$(element);
  }
}

/***************************************************************************************************
/ 
/***************************************************************************************************/
export class AgendaItem {
  Id?: string = '';
  Datum?: string = '';
  Tijd?: string = '';
  EvenementNaam?: string = '';
  Lokatie?: string = '';
  Type?: string = '';
  DoelGroep?: string = '';
  Toelichting?: string = '';
  Inschrijven?: string = '';
  Inschrijfgeld?: string = '';
  BetaalMethode?: string = '';
  ContactPersoon?: string = '';
  Vervoer?: string = '';
  VerzamelAfspraak?: string = '';
  Extra1?: string = '';
  Extra2?: string = '';
}

/***************************************************************************************************
/ 
/***************************************************************************************************/
export class OrganisatieValues
 {
  public static table: any[] = [
    { Value: '0', Label: 'NTTB' },
    { Value: '1', Label: 'Midden' },
    { Value: '2', Label: 'TTVN' },
    { Value: '3', Label: 'Overig' },
  ];
  // getracht onderstaand met Enums op te lossen.
  // wordt lastig als je in de template en dropdown wil maken met *ngFor
  public static GetLabel(value: string): string {
    if (!value) {
      return '';
    }
    return this.table.find(x => x.Value === value).Label;
  }
}

/***************************************************************************************************
/ 
/***************************************************************************************************/
export class DoelgroepValues {
  public static table: any[] = [
    { Value: 'S', Label: 'Senioren' },
    { Value: 'J', Label: 'Jeugd' },
  ];
  public static GetLabel(value: string): string {
    if (!value) {
      return '';
    }
    return this.table.find(x => x.Value === value).Label;
  }
}

/***************************************************************************************************
/ 
/***************************************************************************************************/
export class TypeValues {
  public static table: any[] = [
    { Value: 'T', Label: 'Toernooi' },
    { Value: 'C', Label: 'Competitie' },
  ];
  public static GetLabel(value: string): string {
    if (!value) {
      return '';
    }
    return this.table.find(x => x.Value === value).Label;
  }
}
