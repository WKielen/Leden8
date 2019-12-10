import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PAGEROLES } from 'src/app/common/classes/Page-Role-Variables';
import { Dictionary } from 'src/app/common/modules/Dictionary';
import { CheckboxDictionairy } from 'src/app/components/checkbox.list.component';


@Component({
    selector: 'app-roles-dialog',
    templateUrl: './roles.dialog.html',
})
export class RolesDialogComponent implements OnInit {

    constructor(
        public dialogRef: MatDialogRef<RolesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public myCheckboxDictionairy:CheckboxDictionairy[]
    ) { }

    toPrintDict: Dictionary = new Dictionary([]);
    rolesList: Section[] = [];

    ngOnInit(): void {
        this.getPagesPerRoles();
        this.fillDisplayList();
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private getPagesPerRoles(): void {
        // Onderstaande gegoogled om gegevens uit de CONST PAGEROLES te halen    
        type PAGEROLES = typeof PAGEROLES;
        let pageRoleKeys = Object.keys(PAGEROLES).map(key => {
            return { text: key, value: key };  // text en value bevatten dezelfde waarde
        });
        let pageRoleValues = Object.values(PAGEROLES).map(value => {
            return { text: value, value: value };  // text en value bevatten dezelfde waarde
        });
        // De resultaten van bovenstaande stop ik in een dictionary
        let pageRolesDict: Dictionary = new Dictionary([]);
        for (let i = 0; i < pageRoleKeys.length; i++) {
            pageRolesDict.add(pageRoleKeys[i].text, pageRoleValues[i].text);
        }
        // toPrintDict = { Bestuur, [ledenPageRole, mailPageRole]}
        // foreach is een rol zoals bestuur, trainer e.d.       { 'Id': ROLES.BESTUUR, 'Value': 'Bestuur' }
        this.myCheckboxDictionairy.forEach(element => {
            // we gaan uitzoeken tot welke pagina deze rol toegang heeft    
            let allowedPages: Array<string> = [];
            // vanuit de pagesroles gaan we kijken of er in de rollen eentje zit gelijk aan die van de checkbox dict
            for (let i = 0; i < pageRolesDict.length(); i++) {
                if (pageRolesDict.values()[i].indexOf(element.Id.toString()) !== -1) {
                    allowedPages.push(pageRolesDict.keys()[i].replace('PageRoles', ''));
                }
            }
            this.toPrintDict.add(element.Value, allowedPages);
        });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    private fillDisplayList(): void {
        for (let i = 0; i < this.toPrintDict.length(); i++) {
            let section: Section = Object();
            section.header = this.toPrintDict.keys()[i];
            section.pages = this.toPrintDict.values()[i].toString().split(',').join(', ');
            this.rolesList.push(section); // add section to list
        }
    }
}

export interface Section {
    header: string;
    pages: string;
}
