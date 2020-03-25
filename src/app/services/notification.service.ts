import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { MailService } from './mail.service';
import { AppError } from '../shared/error-handling/app-error';
import { Observable } from 'rxjs';
import { retry, tap, catchError } from 'rxjs/operators';
import { LedenItem, LedenService } from './leden.service';
import { stringToKeyValue } from '@angular/flex-layout/extended/typings/style/style-transforms';

@Injectable({
  providedIn: 'root'
})

export class NotificationService extends DataService {

  constructor(
    private mailService: MailService,
    private ledenService: LedenService,
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
  / Ik gooi alle records weg die van deze UserId. Dus alle subscriptions worden weggegooid. 
  / Dit gebeurt dmv button op notification.dialog.ts
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
  / Na het versturen van de notification, de firebase notification server kan een error teruggeven.
  / Error 404 of 410 geeft aan dat de subscription niet meer geldig is. Daarom moet de entry van deze
  / subscription uit de DB worden verwijderd.
  /***************************************************************************************************/
  public deleteToken$(Token: string): Observable<Object> {
    return this.http.delete(this.url + '/deletetoken?token=' + "'" + btoa(Token) + "'")
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
  / Hier stuur ik een notificatie aan iedereen met een bepaalde rol. Om dit te doen, lees ik eerst alle
  / leden in met zijn rol. Per lid ga ik de rollen van het lid 'crossreferencen' met de opgegeven rollen.
  /***************************************************************************************************/
  public sendNotificationsForRole(audiance: string[], header: string, message: string): void {
    let sub = this.ledenService.getRol$()
      .subscribe((data: Array<LedenItem>) => {
        const ledenLijst: Array<LedenItem> = data;
        ledenLijst.forEach(lid => {
          this.processLid(lid, audiance, header, message);
        })
      });
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Per lid ga ik de rollen van het lid 'crossreferencen' met de opgegeven rollen. Als ik een overeenstemming
  / vind dan wordt er een notification gestuurd en ga ik door met het volgende lid.
  /***************************************************************************************************/
  private processLid(lid: LedenItem, audiance: string[], header: string, message: string): void {
    if (!lid.Rol) {
      return;
    }
    const userRoles = lid.Rol.split(',');  //  AD, YY
    for (let i = 0; i < userRoles.length; i++) {
      for (let j = 0; j < audiance.length; j++) {
        if (userRoles[i] == audiance[j]) {
          this.sendNotificationToUserId(lid.BondsNr, header, message);
          return;
        }
      }
    }
  }

  /***************************************************************************************************
  / Stuur een notificatie naar alle registraties van een userid. Ik lees eerst alle registraties met 
  / dit userid in en dan stuur ik elke browser een melding
  /***************************************************************************************************/
  public sendNotificationToUserIds(UserIdArray: string[], header: string, message: string): void {
    UserIdArray.forEach(userid => {
      this.sendNotificationToUserId(userid, header, message);
    })
  }

  /***************************************************************************************************
  / Stuur een notificatie naar alle registraties van een userid. Ik lees eerst alle registraties met 
  / dit userid in en dan stuur ik elke browser een melding
  /***************************************************************************************************/
  public sendNotificationToUserId(UserId: string, header: string, message: string): void {
    // console.log('sendNotificationToUserId',UserId,  header, message );
    let sub = this.getSubscribtionsUserId$(UserId)
      .subscribe(data => {
        let tokenArray = data as Array<string>;
        if (tokenArray) {
          tokenArray.forEach(token => {
            this.sendNotification(atob(token['Token']), header, message);
          })
        }
      },
        (error: AppError) => {
          console.log("error", error);
        })
    this.registerSubscription(sub);
  }

  /***************************************************************************************************
  / Get alle registraties van een userid
  /***************************************************************************************************/
  private getSubscribtionsUserId$(UserId: string): Observable<Object> {
    return this.http.get(this.url + '/getuserid?userid=' + "'" + UserId + "'")
      .pipe(
        retry(3),
        tap(
          data => console.log('Received: ', data),
          error => console.log('Oeps: ', error)
        ),
        catchError(this.errorHandler)
      );
  }

  /***************************************************************************************************
  / Stuur een notificatie naar de mail server die het door zal sturen naar de Firebase Notification Service
  /***************************************************************************************************/
  private sendNotification(token: string, header: string, message: string): void {
    let sub = this.mailService.notification$({ 'sub_token': token, 'message': NotificationService.Create_WS_Payload(header, message) })
      .subscribe((data: string) => {
        let message:string = data['failed'];
        if (message != null) {

          if (message.indexOf('failed') !== -1 && (message.indexOf('404') !== -1 || message.indexOf('410') !== -1)) {
            let sub2 = this.deleteToken$(token).subscribe();
            this.registerSubscription(sub2);
          }
          // console.log('failed text', data['failed']);  // todo if 410  or 404 dat weggooien
        }
      },
        (error: AppError) => {
          console.log("error", error);
        }
      );
    this.registerSubscription(sub);
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
    payload += ', "badge": "assets/icons/badge-logo.png"';
    payload += ', "vibrate": [100, 50, 100]';
    payload += ', "data": {"primaryKey": "3198048"}';
    // payload += ', "actions": [{"action": "explore","title": "Go to the site"}]';
    payload += '}}';
    return payload;
  }



  public sendNotificationToUserId2(UserId: string, header: string, message: string): void {
    console.log('sendNotificationToUserId',UserId,  header, message );
    let sub = this.getSubscribtionsUserId$(UserId)
      .subscribe(data => {
        console.log('received data',data);
        let tokenArray = data as Array<string>;
        if (tokenArray) {
          tokenArray.forEach(token => {
            this.sendNotification2$(token, header, message).subscribe();
          })
        }
      },
        (error: AppError) => {
          console.log("error", error);
        })
    this.registerSubscription(sub);
  }


  public sendNotification2$(token: string, header: string, message: string): Observable<Object> {

    return this.http.post(this.url + '/sendnotification', '{"token": "' + token['Token'] + '"}')  
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
/ Record used for storing and reading the datbase
/***************************************************************************************************/
export class NotificationRecord {
  Id: number;
  UserId: string;
  Token: string;
}
