import { ErrorHandler, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppNavComponent } from './app-nav/app-nav.component';
import { LayoutModule } from '@angular/cdk/layout';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';

// myRoutingComponents bevat alle scherm components.
import { AppRoutingModule,  myRoutingComponents } from './app-routing.module';
import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { AdminAuthGuard } from './services/admin-auth-guard.service';

// Hierin zitten alle Material Deisgn components
import { CustomMaterialModule } from './material.module';
import {FlexLayoutModule} from '@angular/flex-layout';

// Onderstaande 3 om bedragen in NL vorm weer te geven via pipe
import { registerLocaleData, APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
registerLocaleData(localeNl);

//import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LedenService } from './services/leden.service';
import { AgendaService } from './services/agenda.service';
import { ParamService } from './services/param.service';
import { TrainingService } from './services/training.service';
import { MailService } from './services/mail.service';
import { NotificationService } from './services/notification.service';

import { AppErrorHandler } from './common/error-handling/app-error-handler';
import { SelectLidDropdownComponent } from './components/select.lid.dropdown.component';
import { CheckboxListComponent } from './components/checkbox.list.component';
import { ParentComponent } from './components/parent.component';
import { ReadTextFileService } from './services/readtextfile.service';
//import { AngularIbanModule } from 'angular-iban';

@NgModule({
  declarations: [
    AppComponent,
    AppNavComponent,
    myRoutingComponents,
    SelectLidDropdownComponent,
    CheckboxListComponent,
    ParentComponent,
  ],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    LayoutModule,
    CustomMaterialModule,
    HttpClientModule,
    FlexLayoutModule,
    // AngularIbanModule,
        // Registratie van sw veranderd omdat we niet in de base href zitten maar in admin.
//        NgbModule,  // bootstrap
    ServiceWorkerModule.register('/app/ngsw-worker.js', { enabled: environment.production })
  ],

    providers: [AuthService,
                AuthGuard,
                AdminAuthGuard,
                LedenService,
                ReadTextFileService,
                {
                  provide: APP_BASE_HREF,
                  useValue : '/'
                },
                {
                  provide: LocationStrategy,
                  useClass: HashLocationStrategy
                },
                AgendaService,
                ParamService,
                MailService,
                TrainingService,
                NotificationService,
                {
                  provide: HTTP_INTERCEPTORS,
                  useClass: TokenInterceptorService,
                  multi: true
                },
                {
                  provide: ErrorHandler,
                  useClass: AppErrorHandler
                },
                {
                  provide: LOCALE_ID,
                  useValue: 'nl'
                }
                ],
                bootstrap: [AppComponent]
})
export class AppModule { }
