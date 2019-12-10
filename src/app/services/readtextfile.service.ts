import { AppError } from '../common/error-handling/app-error';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, retry } from 'rxjs/operators';
import { throwError as observableThrowError, Observable } from 'rxjs';
import { NotFoundError } from '../common/error-handling/not-found-error';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class ReadTextFileService {

  constructor(protected http: HttpClient) {}

  public read(filename:string): Observable<string> {
    return this.http.get('assets/' + filename, {responseType: 'text'})
    .pipe(
      retry( 3 ),
      tap(
        data => console.log('Read: ', data),
        error => console.log( 'Oeps: ', error )
      ),
      catchError(this.errorHandler)
    );
  } 

/***************************************************************************************************
/ Separe errorhandling because it isn't inherited from parent DataServices
/***************************************************************************************************/
  protected errorHandler(error: HttpErrorResponse) {
    if (error.status === 404) {
      return observableThrowError(new NotFoundError());
    }

    return observableThrowError(new AppError(error));
  }
}
