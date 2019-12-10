import { AppError } from '../common/error-handling/app-error';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { tap, catchError, retry } from 'rxjs/operators';
import { throwError as observableThrowError } from 'rxjs';
import { NotFoundError } from '../common/error-handling/not-found-error';
import { DuplicateKeyError } from '../common/error-handling/duplicate-key-error';
import { NoChangesMadeError } from '../common/error-handling/no-changes-made-error';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataService {

  constructor(protected url: string,
              protected http: HttpClient) {}

  getAll$() {
    return  this.http.get(this.url + '/GetAll')
    .pipe(
      retry( 3 ),
      tap( // Log the result or error
        data => console.log( 'Received: ', data ),
        error => console.log( 'Oeps: ', error )
      ),
      catchError(this.errorHandler)
    );
  }

  update$( resource ) {
    // console.log('received in update$', resource);
    return  this.http.patch(this.url + '/Update', resource)
    .pipe(
      retry( 3 ),
      tap(
        data => console.log( 'Updated: ', data ),
        error => console.log( 'Oeps: ', error )
      ),
      catchError(this.errorHandler)
    );
  }

  create$( resource ) {
    return  this.http.post(this.url + '/Insert', resource)
      .pipe(
        retry( 3 ),
        tap(
          data => console.log( 'Inserted: ', data ),
          error => console.log( 'Oeps: ', error )
        ),
        catchError(this.errorHandler)
      );
  }
  delete$( id ) {
    return  this.http.delete(this.url + '/Delete?Id=' + '"' + id + '"')
      .pipe(
        retry( 3 ),
        tap(
          data => console.log( 'Deleted: ', data ),
          error => console.log( 'Oeps: ', error )
        ),
        catchError(this.errorHandler)
      );
  }

  protected errorHandler(error: HttpErrorResponse) {

    if (error.status === 404) {
    return observableThrowError(new NotFoundError());
    }

    if (error.status === 409) {
      return observableThrowError(new DuplicateKeyError());
    }

    if (error.status === 422) {
      return observableThrowError(new NoChangesMadeError());
    }

    return observableThrowError(new AppError(error));
  }
}
