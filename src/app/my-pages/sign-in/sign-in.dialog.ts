import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MyErrorStateMatcher } from '../../shared/error-handling/Field.Error.State.Matcher';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from './../../../environments/environment';

@Component({
    selector: 'app-signin-dialog',
    templateUrl: './sign-in.dialog.html'
})
export class SignInDialogComponent {

    showPw = false;
    keepSignedIn: boolean;
    invalidLogin: boolean;

    matcher = new MyErrorStateMatcher();
    loginForm = new FormGroup ({
        userid : new FormControl(
            '',
            [Validators.required, Validators.minLength(7), Validators.maxLength(7) ]
        ),
        password : new FormControl(
            '',
            [Validators.required, Validators.minLength(6) ]
        ),
        keepSignedIn : new FormControl()
    });

    constructor(
        private router: Router,
        private authService: AuthService,
        private route: ActivatedRoute,
        public dialogRef: MatDialogRef<SignInDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: Credentials) { }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onSubmit(): void {
        const credentials = { 'userid': this.loginForm.value['userid'], 'password': this.loginForm.value['password'],
                             'database': environment.databaseName, 'keepsignedin': this.loginForm.value['keepSignedIn'] ? 'true' : 'false'};
        this.authService.login$(credentials)
          .subscribe(result => {
            if (result) {
              const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
              this.router.navigate([returnUrl || environment.dashboardPage ]);
              this.dialogRef.close(true);
            } else {
              this.invalidLogin = true;
            }
        },
        err => {
          this.invalidLogin = true;
        });

    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    onCancel(): void {
        this.dialogRef.close(false);
    }

    /***************************************************************************************************
    / Properties
    /***************************************************************************************************/
    get userid() {
        return this.loginForm.get('userid');
    }

    get password() {
        return this.loginForm.get('password');
    }
}

/***************************************************************************************************
/ 
/***************************************************************************************************/
export interface Credentials {
    userid: string;
    password: string;
    database: string;
    keepsignedin: boolean;
}
