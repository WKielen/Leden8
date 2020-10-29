import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { CustomMaterialModule } from './material.module';

import { LoginRoutingModule } from './login-routing.module';

import { LoginComponent } from './login/login.component';
import { SignInDialogComponent } from './sign-in-dialog/sign-in.dialog';

@NgModule({
  declarations: [
    LoginComponent, 
    SignInDialogComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LoginRoutingModule,
    CustomMaterialModule,
  ]
})
export class LoginModule { }
