import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { map, tap, retry } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class TrainingService extends DataService {

  constructor(
    http: HttpClient) {
    super(environment.baseUrl + '/training', http);
  }

  /***************************************************************************************************
  / Haal de trainingsdeelname van 1 specifieke dag op
  /***************************************************************************************************/
  public getDate$(TrainingDate: Date): Observable<TrainingDag> {
    return this.http.get(environment.baseUrl + '/training/get?Datum=' + "'" + TrainingDate.to_YYYY_MM_DD()  + "'"  )
    .pipe(
      retry(1),
      map(data => {
        let tmp = data as TrainingRecord;
        let response = new TrainingDag();
        response.Id = tmp.Id;
        response.Datum = tmp.Datum
        response.DeelnameList = JSON.parse(tmp.Value)
        return response;
      }),
      tap( // Log the result or error
        data => console.log('Received: ', data),
        error => console.log('Oeps: ', error)
      ),
   );
  }

  /***************************************************************************************************
  / Het object wordt gekopieerd naar een vorm die kan worden opgeslagen
  /***************************************************************************************************/
  public updateRec$(trainingsDag:TrainingDag): Observable<Object> {
    return this.update$(this.createSavableRecord(trainingsDag));
  }

  /***************************************************************************************************
  / Het object wordt gekopieerd naar een vorm die kan worden opgeslagen
  /***************************************************************************************************/
  public insertRec$(trainingsDag:TrainingDag): Observable<Object> {
    return this.create$(this.createSavableRecord(trainingsDag));
  }

/***************************************************************************************************
/ The Trainingsdag object can't be stored directly into the database, so I transform it to a Trainingsrecord.
/***************************************************************************************************/
  private createSavableRecord(trainingDag: TrainingDag): TrainingRecord {
    let response = new TrainingRecord();
    response.Id = trainingDag.Id;
    response.Datum = trainingDag.Datum;
    response.Value = JSON.stringify(trainingDag.DeelnameList);
    return response;
  }


  /***************************************************************************************************
  / Haal alle trainingsdeelname vanaf specifieke dag op
  /***************************************************************************************************/
  public getFromDate$(TrainingDate: Date): Observable<Object> {
    return this.http.get(environment.baseUrl + '/training/getfromdate?Datum=' + "'" + TrainingDate.to_YYYY_MM_DD()  + "'"  )
    .pipe(
      retry(3),
      tap( // Log the result or error
        data => console.log('Received: ', data),
        error => console.log('Oeps: ', error)
      ),
   );
  }
}



/***************************************************************************************************
/ Record used for storing and reading the datbase
/***************************************************************************************************/
export class TrainingRecord {
  Id: string;
  Datum: string;
  Value: string;
}

/***************************************************************************************************
/ Same function as TrainingRecord but value deserialized into DeelnameList
/***************************************************************************************************/
export class TrainingDag {
  Id: string = '';
  Datum: string;
  DeelnameList: TrainingItem[] = [];

  constructor(){
    this.Datum = new Date().to_YYYY_MM_DD();
  }
}

/***************************************************************************************************
/ A item in the list of TrainingsDagen
/***************************************************************************************************/
export class TrainingItem {
  public static readonly AFWEZIG = 0;
  public static readonly AANWEZIG = 1;
  public static readonly AFGEMELD = 2;

  LidNr: number = 0;
  State?: number;

  constructor(){
    this.State = TrainingItem.AFWEZIG;
  }
}
