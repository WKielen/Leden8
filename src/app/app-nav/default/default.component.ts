import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LogonData } from 'src/app/shared/classes/LogonData';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.scss']
})
export class DefaultComponent implements OnInit {

  sideBarOpen: boolean = false;
  logonData: LogonData = new LogonData();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
  ) { }

  ngOnInit() {
    this.setUserInfo();
  }

  isHandset = false;
  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => {
        this.isHandset = result.matches;
        return result.matches; })
    );

  sideBarToggler() {
    this.sideBarSetVisibilty(!this.sideBarOpen);
  }

  sideBarSetVisibilty($event) {
    this.sideBarOpen = $event;
  }

  logonStatus($event) {
    this.logonData = $event;
    this.sideBarSetVisibilty(this.logonData.ShouldDisplayMenu);
  }
  
  setUserInfo(): void {
    this.logonData.IsLoggedOn = this.authService.isLoggedIn();
    this.logonData.Name = this.authService.fullName;
    this.logonData.UserId = this.authService.userId;
  }

}
