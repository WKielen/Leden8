import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-a2hs',
  templateUrl: './a2hs.component.html',
  styleUrls: ['./a2hs.component.css']
})
export class A2hsComponent implements OnInit {

  constructor(public authService: AuthService) { }
  public myWindow: any;

  ngOnInit() {
    this.myWindow = window;
  
  }
}
