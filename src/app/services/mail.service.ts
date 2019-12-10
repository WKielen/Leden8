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
    this.paramService.readParamData$('mailboxparam' + this.authService.userId,
      JSON.stringify(new MailBoxParam()),
      'Om in te loggen in de mailbox')
      .subscribe(data => {
        let result = data as string;
        this.mailBoxParam = JSON.parse(result) as MailBoxParam;
      },
        (error: AppError) => {
          console.log("error", error);
        }
      )
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