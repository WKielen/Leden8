import { environment } from '../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DataService } from './data.service';
import { map, tap, retry } from 'rxjs/operators';
import { Observable } from 'rxjs/internal/Observable';
import { MailService } from './mail.service';
import { AppError } from '../common/error-handling/app-error';
import { RolesDialogComponent } from '../my-pages/users/roles.dialog';

@Injectable({
  providedIn: 'root'
})

export class NotificationService extends DataService {

  constructor(
    private mailService: MailService,
    http: HttpClient) {
    super(environment.baseUrl + '/notification', http);
  }


//   /***************************************************************************************************
//   / Het object wordt gekopieerd naar een vorm die kan worden opgeslagen
//   /***************************************************************************************************/
//   public updateRec$(trainingsDag:NotificationRecord): Observable<Object> {
//     return this.update$(this.createSavableRecord(trainingsDag));
//   }

//   /***************************************************************************************************
//   / Het object wordt gekopieerd naar een vorm die kan worden opgeslagen
//   /***************************************************************************************************/
//   public insertRec$(trainingsDag:NotificationRecord): Observable<Object> {
//     return this.create$(this.createSavableRecord(trainingsDag));
//   }

// /***************************************************************************************************
// / The Trainingsdag object can't be stored directly into the database, so I transform it to a Trainingsrecord.
// /***************************************************************************************************/
//   private createSavableRecord(trainingDag: NotificationRecord): NotificationRecord {
//     let response = new NotificationRecord();
//     response.Id = trainingDag.Id;
//     response.Datum = trainingDag.Datum;
//     response.Value = JSON.stringify(trainingDag.DeelnameList);
//     return response;
//   }

  private static Create_WS_Payload(message: string): string {
    let payload = '{"notification":';
    payload += '{"title": "TTVN Nieuwegein"';
    payload += '"body": "' + message + '",';
    payload += '"icon": "assets/icons/app-logo-72x72.png",';
    payload += '"vibrate": [100, 50, 100],';
    payload += '"data": {"primaryKey": "1"},';
    payload += '"actions": ';
    payload += '[{"action": "explore",';
    payload += '"title": "Go to the site"}]}}';
    return payload; 
  }

  public sendNotifications(audiance :string[], message:string): void {

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

  private sendNotification(token :string, message:string): void {
    this.mailService.notification$({'sub_token':token, 'message': NotificationService.Create_WS_Payload(message)})
      .subscribe(data => {
        let result = data as string;
        console.log('result van mailService', result, JSON.stringify(result));

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

