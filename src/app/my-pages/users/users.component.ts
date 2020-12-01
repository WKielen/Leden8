import { PasswordValidators } from './../users/password.validator';
import { LidExtract } from '../../shared/components/select.lid.dropdown.component';
import { Component, OnInit } from '@angular/core';
import { LedenService } from '../../services/leden.service';
import { CheckboxDictionairy } from '../../shared/components/checkbox.list.component';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MyErrorStateMatcher } from '../../shared/error-handling/Field.Error.State.Matcher';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AppError } from '../../shared/error-handling/app-error';
import { DuplicateKeyError } from 'src/app/shared/error-handling/duplicate-key-error';
import { ROLES } from 'src/app/shared/classes/Page-Role-Variables';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { RolesDialogComponent } from './roles.dialog';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
    selector: 'app-users-page',
    templateUrl: './users.component.html',
    styleUrls: ['./users.component.css']
})

export class UsersComponent extends ParentComponent implements OnInit {
    ledenArray;
    lidRol: LidExtract;
    lidPw: LidExtract;
    response = null;
    csString = null;

    showPw = false;
    matcher = new MyErrorStateMatcher();
    passWordFormGroup = new FormGroup({
        password1: new FormControl(
            '',
            [Validators.required, Validators.minLength(6)]
        ),
        password2: new FormControl(
            '',
            [Validators.required, Validators.minLength(6)]
        )
    }, { validators: PasswordValidators.passwordsShouldMatch }
    );

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    myCheckboxDictionairy: CheckboxDictionairy[] = [
        { 'Id': ROLES.BESTUUR, 'Value': 'Bestuur' },
        { 'Id': ROLES.JC, 'Value': 'Jeugdcommissie' },
        { 'Id': ROLES.TRAINER, 'Value': 'Trainer' },
        { 'Id': ROLES.LEDENADMIN, 'Value': 'Ledenadministratie' },
        { 'Id': ROLES.PENNINGMEESTER, 'Value': 'Penningmeester' },
        { 'Id': ROLES.TEST, 'Value': 'Test pagina\'s' },
        { 'Id': ROLES.ADMIN, 'Value': 'Admin' },
    ];

    constructor(private ledenService: LedenService,
        protected snackBar: MatSnackBar,
        public dialog: MatDialog
    ) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.registerSubscription(
            this.ledenService.getRol$()
                .subscribe(data => {
                    this.response = data;
                    this.ledenArray = this.response;
                }));
    }

    /***************************************************************************************************
    / dropdown Roles
    /***************************************************************************************************/
    onUserSelectedRole(lid): void {
        this.lidRol = lid;
        this.csString = this.lidRol.Rol;
    }

    /***************************************************************************************************
    / dropdown password
    /***************************************************************************************************/
    onUserSelectedPassword(lid): void {
        console.log('user 2 selected', lid);
        this.lidPw = lid;
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onRoleClicked($event): void {
        // I don't why but I also get a MouseEvent here. I just ignore it.
        if (!this.lidRol || $event instanceof MouseEvent) {
            return;
        }
        this.lidRol.Rol = $event.type;
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onSaveRol(): void {
        if (this.lidRol) {
            const updateRecord = { 'LidNr': this.lidRol.LidNr, 'Rol': this.lidRol.Rol };
            let sub = this.ledenService.update$(updateRecord)
                .subscribe(addResult => {
                    this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
                },
                    (error: AppError) => {
                        if (error instanceof NoChangesMadeError) {
                            this.showSnackBar(SnackbarTexts.NoChanges, '');
                        } else { throw error; }
                    });
            this.registerSubscription(sub);
        }
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onShowRoles(): void {
        this.dialog.open(RolesDialogComponent, {
            data: this.myCheckboxDictionairy
        })
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onSavePassword(): void {
        const updateRecord = { 'LidNr': this.lidPw.LidNr, 'ToegangsCode': this.password1.value };
        let sub = this.ledenService.update$(updateRecord)
            .subscribe(addResult => {
                this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
            },
                (error: AppError) => {
                    if (error instanceof DuplicateKeyError) {
                        this.showSnackBar(SnackbarTexts.NoChanges, '');
                    } else { throw error; }
                });
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Properties
    /***************************************************************************************************/
    get password1() {
        return this.passWordFormGroup.get('password1');
    }
    get password2() {
        return this.passWordFormGroup.get('password2');
    }
}

