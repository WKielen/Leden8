import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { retry, tap, catchError } from 'rxjs/operators';
import { AuthService } from 'src/app/services/auth.service';
import { ParamService } from './param.service';
import { AppError } from '../common/error-handling/app-error';
import { Observable } from 'rxjs/internal/Observable';

@Injectable({
  providedIn: 'root'
})

export class MailService extends DataService {

  public mailBoxParam = new MailBoxParam();

  constructor(
    http: HttpClient,
    protected paramService: ParamService,
    protected authService: AuthService,
  ) {
    super(environment.baseUrl + '/param', http);
    this.readMailLoginData();
  }

  /***************************************************************************************************
  / Send a mail
  /***************************************************************************************************/
  mail$(mailItems: MailItem[] ): Observable<Object> {
    let externalRecord = new ExternalMailApiRecord();
    externalRecord.UserId = this.mailBoxParam.UserId;
    externalRecord.Password = this.mailBoxParam.Password;
    externalRecord.From = this.mailBoxParam.Name + '<' + this.mailBoxParam.UserId + '>';
    externalRecord.MailItems = mailItems;

    return this.http.post(environment.mailUrl + '/mail', externalRecord)
      .pipe(
        retry(1),
        tap(
          data => console.log('Inserted: ', data),
          error => console.log('Oeps: ', error)
        ),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Lees de mail box credetials uit de Param tabel
  /***************************************************************************************************/
  private readMailLoginData(): void {
    let sub = this.paramService.readParamData$('mailboxparam' + this.authService.userId,
      JSON.stringify(new MailBoxParam()),
      'Om in te loggen in de mailbox')
      .subscribe(data => {
        let result = data as string;
        this.mailBoxParam = JSON.parse(result) as MailBoxParam;
      },
        (error: AppError) => {
          console.log("error", error);
        }
      );
      this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Send a notification to the email server. 
  / De mailserver dient als vehicle om een bericht te sturen naar Firebase Message Service
  / Deze service stuurt het bericht naar de browser die het laten zien op het scherm.
  /***************************************************************************************************/
  notification$(token:any): Observable<Object> {
    console.log('mail notification');
    // return this.http.post(environment.mailUrl + '/notification', externalRecord)  
    return this.http.post('http://localhost:5000' + '/notification', token)  //TODO
      .pipe(
        retry(1),
        tap(
          data => console.log('Notification: ', data),
          error => console.log('Oeps: ', error)
        ),
        catchError(this.errorHandler)
      );
  }
  /***************************************************************************************************
  / Send a notification to the email server. 
  / De mailserver dient als vehicle om een bericht te sturen naar Firebase Message Service
  / Deze service stuurt het bericht naar de browser die het laten zien op het scherm.
  /***************************************************************************************************/
  getPublicKey$(): Observable<Object> {
    return this.http.get('http://localhost:5000' + '/notification')  //TODO
      .pipe(
        retry(1),
        tap(
          data => console.log('Notification: ', data),
          error => console.log('Oeps: ', error)
        ),
        catchError(this.errorHandler)
      );
  }


}

/***************************************************************************************************
/ This record is sent to the mail API
/***************************************************************************************************/
export class ExternalMailApiRecord {
  UserId: string = '';
  Password: string = '';
  From: string = '';
  MailItems: MailItem[] = [];
}

/***************************************************************************************************
/ An email
/***************************************************************************************************/
export class MailItem {
  To: string = '';
  // CC: string = '';
  // BCC: string = '';
  Subject: string = '';
  Message: string[] = [];
}

/***************************************************************************************************
/ This record is stored in the Param table as value of a param record
/***************************************************************************************************/
export class MailBoxParam {
  UserId: string = '';
  Password: string = ''
  Name: string = '';
}