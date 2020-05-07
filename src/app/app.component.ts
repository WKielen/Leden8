import { Component, Injectable } from '@angular/core';
// import { environment } from './../environments/environment';
// import { SwUpdate } from '@angular/service-worker';
import { A2hsService } from './services/a2hs.service';

@Component({
  selector: 'app-root',
  //template: '<router-outlet></router-outlet>',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

@Injectable()
export class AppComponent {
  constructor(public a2hs: A2hsService) {
    // A2HS - START
    a2hs.checkUserAgent();
    a2hs.trackStandalone();
    window.addEventListener('beforeinstallprompt', (e) => {

      // show the add button
      a2hs.promptIntercepted = true;
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      // no matter what, the snack-bar shows in 68 (06/16/2018 11:05 AM)
      e.preventDefault();
      // Stash the event so it can be displayed when the user wants.
      a2hs.deferredPrompt = e;
      a2hs.promptSaved = true;

    });
    window.addEventListener('appinstalled', (evt) => {
      a2hs.trackInstalled();
      // hide the add button
      // a2hs.promptIntercepted = false;
    });
    // A2HS - END



    // swUpdate.available.subscribe(event => {
    //   if (confirm("Er is een nieuwe versie beschikbaar. Deze nieuwe versie laden?")) {
    //     window.location.reload();
    //   }
    // });
    // console.log('environment', environment);

    // if (navigator.onLine) {
    //   console.log('You are online');
    // } else {
    //   console.log('You are offline');
    // }

  }
}
