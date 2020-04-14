// This component show a list of checkboxes. The number and text of the boxes are dependend on
// the input checkboxDictionairy. (See interface below).
// The id's in the csString input will be checkbox.checked. Has to be a comma separated string.
//
// use as: <app-choose-role-checkboxes [csString]="csString" [checkboxDictionairy]='myDictionairy' (click)="onRoleClicked($event)"></app-choose-role-checkboxes>
//
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { OnChanges, QueryList, ViewChildren } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';

@Component({
  selector: 'app-checkbox-list',
  template:
  '<form>' +
  '<div *ngFor="let item of myDictionairy">' +
    '<mat-checkbox #cb [checked]="item.isChecked" (change)="onCheckBoxChanged($event)" [id]="item.Id"  color="primary">' +
      '{{item.Value}}' +
    '</mat-checkbox>' +
  '</div>' +
 '</form>'
})
export class CheckboxListComponent implements OnChanges {

  @Input('csString') csString: string;
  @Input('checkboxDictionairy') myDictionairy: CheckboxDictionairy[];
  @Output('click') clicked = new EventEmitter<Event>();

  // Als met ngFor dynamisch children worden toegevoegd kan je met ViewChild geen referentie krijgen
  // naar de elementen. Dus 'meervoud' gebruiken --> ViewChildren
  @ViewChildren('cb') checkboxes: QueryList<MatCheckbox>;

  inputArray: Array<string>;

  // myDictionairy: CheckboxDictionairy[] = [
  //   { 'Id' : 'AD', 'Value': 'Admin'},
  //   { 'Id' : 'AM', 'Value': 'Agenda aanpassen'},
  //   { 'Id' : 'LL', 'Value': 'Leden lezen'},
  //   { 'Id' : 'LM', 'Value': 'Leden aanpassen'}
  // ];

  // Deze lifecycle hook wordt aangeroepen wanneer de input (csString) wijzigt. Had gehoopt op constructor of ngOnInit waar deze worden niet aangeroepen.
  ngOnChanges() {
    if (this.csString === null) {
      this.clicked.emit(new Event(''));
      return;
    }
    if (this.csString !== '') {
      this.inputArray = this.csString.split(',');
    } else {
      this.inputArray = new Array<string>();
    }


    // console.log('input on init', this.inputArray, 'string', this.csString);

    // We gaan de checkboxes aanzetten waar nodig.
    for (let i = 0; i < this.checkboxes.length; i++) {
      const idOfCheckbox = this.checkboxes.toArray()[i].id;
      if (this.inputArray.indexOf(idOfCheckbox) === -1) {
        this.checkboxes.toArray()[i].checked = false;
      } else {
        this.checkboxes.toArray()[i].checked = true;
      }
    }
  }

  onCheckBoxChanged($event) {
    // De checkboxen hebben in de id de dictiorairy-id gekregen.
    try {
      const id = $event.source.id;
      // console.log('intput', this.inputArray, 'id', id);

      if ($event.checked) {
        // checked dus toevoegen
        this.inputArray.push(id);
        // console.log('input na push', this.inputArray);
      } else {
        // unchecken dus verwijderen
        const index = this.inputArray.indexOf(id);
        this.inputArray.splice(index, 1);
        // console.log('input na pop', this.inputArray);
      }
      let returnString = '';
      for (let i = 0; i < this.inputArray.length; i++) {
        returnString = returnString + this.inputArray[i];
        if (i < this.inputArray.length - 1) {
          returnString = returnString + ',';
        }
      }
      // console.log('intput', this.inputArray, 'returnstring', returnString);

      this.clicked.emit(new Event(returnString)); // mystring is dus output van deze component
    } catch {}
  }
}
export interface CheckboxDictionairy {
  Id: String;
  Value: string;
}
