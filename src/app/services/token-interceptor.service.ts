import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpInterceptor } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class TokenInterceptorService implements HttpInterceptor {

  constructor(private authService: AuthService
            , private router: Router
    ) { }

  intercept (req, next) {

    if (!navigator.onLine) {
      this.router.navigate(['/offline']);
      return [];
    }

    let tokenizedReq;
    if (this.authService.isLoggedIn()) {
      tokenizedReq = req.clone({
        // setHeaders: {
        //   'Authorization': 'Bearer ' + this.authService.token
        // , 'Content-Type' : 'application/json'
        // , 'Accept': 'application/json'
        // }
        headers: req.headers.set('Authorization', 'Bearer ' + this.authService.token)
                            .set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')
      });
    } else { // Als we niet ingelogd zijn dan ook het token niet meesturen.
      tokenizedReq = req.clone({
        headers: req.headers.set('Content-Type', 'application/json')
                            .set('Accept', 'application/json')
                            .set('Database', environment.databaseName)
      });
    }
    return next.handle(tokenizedReq);
  }
}
