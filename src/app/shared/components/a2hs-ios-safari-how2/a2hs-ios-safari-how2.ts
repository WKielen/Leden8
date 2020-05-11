import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-ios-safari-how2',
  templateUrl: './a2hs-ios-safari-how2.html',
  styleUrls: ['./a2hs-ios-safari-how2.css']
})
export class A2hsSafariHow2 {

  constructor(public authService: AuthService) { }
/***************************************************************************************************
/ Deze component laat op iOS devices een popup ziet hoe ze deze app aan het homescreen moeten toevoegen
/***************************************************************************************************/

}
