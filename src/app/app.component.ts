import { Component, OnInit } from '@angular/core';
import { environment } from './../environments/environment';
import { SwUpdate } from '@angular/service-worker';

@Component({
  selector: 'app-root',
  //template: '<router-outlet></router-outlet>',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private swUpdate: SwUpdate) {
    // swUpdate.available.subscribe(event => {
    //   swUpdate.activateUpdate().then(() => document.location.reload());

    // });
    console.log('environment', environment);

    if (navigator.onLine) {
      console.log('You are online');
    } else {
      console.log('You are offline');
    }

  }
  ngOnInit() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.available.subscribe(() => {
        if (confirm("Er is een nieuwe versie beschikbaar. Deze nieuwe versie laden?")) {
          window.location.reload();
        }
      });
    }
  }
}
