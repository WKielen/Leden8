import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { MailService } from './mail.service';
import { AppError } from '../common/error-handling/app-error';
import { Observable } from 'rxjs';
import { retry, tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class NotificationService extends DataService {

  constructor(
    private mailService: MailService,
    http: HttpClient) {
    super(environment.baseUrl + '/notification', http);
  }

  /***************************************************************************************************
  / De public key is nodig om de service worker het token te laten maken
  /***************************************************************************************************/
  public GetPublicKey$(): Observable<Object> {
    return this.mailService.getPublicKey$();
  }

  /***************************************************************************************************
  / Bewaar de subscription. Voordat we bewaren controleren we eerst of de browser al geregistreerd is. 
  /***************************************************************************************************/
  public SaveSubscription(resource): boolean {
    // todo: controleren of the subscription al in de DB zit. zo ja dan return false
    super.create$(resource)
      .subscribe();
    return true;
    // todo : error handling
  }

  /***************************************************************************************************
  / Ik gooi alle records weg die van deze UserId. Dus alle subscriptions worden weggegooid. 
  /***************************************************************************************************/
  public Unsubscribe(UserId: string): Observable<Object> {
    return this.http.delete(this.url + '/deletefromuserid?userid=' + "'" + UserId + "'")
      .pipe(
        retry(3),
        tap(
          data => console.log('Deleted: ', data),
          error => console.log('Oeps: ', error)
        ),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / We creeeren een payload voor de service worker. Deze snapt dit bericht.
  /***************************************************************************************************/
  private static Create_WS_Payload(header: string, message: string): string {
    let payload = '{"notification": {"title": "';
    payload += header;
    payload += '","body": "';
    payload += message;
    payload += '"';
    payload += ', "icon": "assets/icons/app-logo-72x72.png"';
    payload += ', "vibrate": [100, 50, 100]';
    payload += ', "data": {"primaryKey": "1"}';
    payload += ', "actions": [{"action": "explore","title": "Go to the site"}]';
    payload += '}}';
    return payload;
  }

  /***************************************************************************************************
  / TODO
  /***************************************************************************************************/
  public sendNotifications(audiance: string[], header: string, message: string): void {
    let notificationRecords: Array<NotificationRecord> = [];
    this.getAll$()
      .subscribe(data => {
        notificationRecords = data as Array<NotificationRecord>;
        notificationRecords.forEach(record => {
          record.Token = atob(record.Token);
          this.sendNotification(record.Token, header, message);
        })
      },
        (error: AppError) => {
          console.log("error", error);
        }
      );


    // audiance.forEach(element => {
    //   if (element typeof Number)
    //     leesDB voor bondsnr
    //     tokens.forEach(element => {
    //       send
    //     });
    //   else {
    //     ledenArray.forEach(element => {
    //       als rol is onze rol   !! n op m relatie
    //         send          
    //     });

    //   }  


    // });



  }

  /***************************************************************************************************
  / Stuur een notificatie naar de mail server die het door zal sturen naar de Firebase Notification Service
  /***************************************************************************************************/
  private sendNotification(token: string, header: string, message: string): void {
    // console.log('token', token);
    // console.log('payload', NotificationService.Create_WS_Payload(header, message));
    this.mailService.notification$({ 'sub_token': token, 'message': NotificationService.Create_WS_Payload(header, message) })
      .subscribe(data => {
        // let result = data as string;
        // console.log('result van mailService', result, JSON.stringify(result));
      },
        (error: AppError) => {
          console.log("error", error);
        }
      );
  }
}

/***************************************************************************************************
/ Record used for storing and reading the datbase
/***************************************************************************************************/
export class NotificationRecord {
  Id: number;
  UserId: number;
  Token: string;
}

