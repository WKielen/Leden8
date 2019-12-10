import { TypeValues, OrginisatieValues, DoelgroepValues } from '../../services/agenda.service';
import { Component, Inject, OnInit, Input } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, DateAdapter } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { FormValueToDutchDateString } from 'src/app/common/modules/DateRoutines';


@Component({
    selector: 'app-agenda-dialog',
    templateUrl: './agenda.dialog.html',
})
export class AgendaDialogComponent implements OnInit {
    agendaItemForm = new FormGroup({
        datum: new FormControl(
            '',
            [Validators.required]
        ),
        tijd: new FormControl(
            '',
            [Validators.required]
        ),
        evenementnaam: new FormControl(
            '',
            [Validators.required]
        ),
        lokatie: new FormControl(
            '',
            [Validators.required]
        ),
        type: new FormControl(
            '',
            [Validators.required]
        ),
        doelgroep: new FormControl(
            '',
            [Validators.required]
        ),
        toelichting: new FormControl(),
        inschrijven: new FormControl(),
        inschrijfgeld: new FormControl(),
        betaalmethode: new FormControl(),
        contactpersoon: new FormControl(),
        vervoer: new FormControl(),
        verzamelafspraak: new FormControl(),
        extra1: new FormControl(
            '',
            [Validators.required]
        ),
    });

    typeValues = TypeValues.table;
    orginisatieValues = OrginisatieValues.table;
    doelgroepValues = DoelgroepValues.table;

    constructor(
        public dialogRef: MatDialogRef<AgendaDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data,
        private adapter: DateAdapter<any>) {
        this.adapter.setLocale('nl');
    }

    ngOnInit(): void {
        this.datum.setValue(this.data.data.Datum);
        this.tijd.setValue(this.data.data.Tijd);
        this.evenementnaam.setValue(this.data.data.EvenementNaam);
        this.lokatie.setValue(this.data.data.Lokatie);
        this.type.setValue(this.data.data.Type);
        this.doelgroep.setValue(this.data.data.DoelGroep);
        this.toelichting.setValue(this.data.data.Toelichting);
        this.inschrijven.setValue(this.data.data.Inschrijven);
        this.inschrijfgeld.setValue(this.data.data.Inschrijfgeld);
        this.betaalmethode.setValue(this.data.data.BetaalMethode);
        this.contactpersoon.setValue(this.data.data.ContactPersoon);
        this.vervoer.setValue(this.data.data.Vervoer);
        this.verzamelafspraak.setValue(this.data.data.VerzamelAfspraak);
        this.extra1.setValue(this.data.data.Extra1);
    }

    /***************************************************************************************************
    / Sluit dialog
    /***************************************************************************************************/
    onSubmit(): void {
        this.data.data.Datum = FormValueToDutchDateString(this.datum.value);
        this.data.data.Tijd = this.tijd.value;
        this.data.data.EvenementNaam = this.evenementnaam.value;
        this.data.data.Lokatie = this.lokatie.value;
        this.data.data.Type = this.type.value;
        this.data.data.DoelGroep = this.doelgroep.value;
        this.data.data.Toelichting = this.toelichting.value;
        this.data.data.Inschrijven = this.inschrijven.value;
        this.data.data.Inschrijfgeld = this.inschrijfgeld.value;
        this.data.data.BetaalMethode = this.betaalmethode.value;
        this.data.data.ContactPersoon = this.contactpersoon.value;
        this.data.data.Vervoer = this.vervoer.value;
        this.data.data.VerzamelAfspraak = this.verzamelafspraak.value;
        this.data.data.Extra1 = this.extra1.value;
        this.dialogRef.close(this.data.data);
    }

/***************************************************************************************************
/ Properties
/***************************************************************************************************/

    get datum() {
        return this.agendaItemForm.get('datum');
    }
    get tijd() {
        return this.agendaItemForm.get('tijd');
    }
    get evenementnaam() {
        return this.agendaItemForm.get('evenementnaam');
    }
    get lokatie() {
        return this.agendaItemForm.get('lokatie');
    }
    get type() {
        return this.agendaItemForm.get('type');
    }
    get doelgroep() {
        return this.agendaItemForm.get('doelgroep');
    }
    get toelichting() {
        return this.agendaItemForm.get('toelichting');
    }
    get inschrijven() {
        return this.agendaItemForm.get('inschrijven');
    }
    get inschrijfgeld() {
        return this.agendaItemForm.get('inschrijfgeld');
    }
    get betaalmethode() {
        return this.agendaItemForm.get('betaalmethode');
    }
    get contactpersoon() {
        return this.agendaItemForm.get('contactpersoon');
    }
    get vervoer() {
        return this.agendaItemForm.get('vervoer');
    }
    get verzamelafspraak() {
        return this.agendaItemForm.get('verzamelafspraak');
    }
    get extra1() {
        return this.agendaItemForm.get('extra1');
    }
}
