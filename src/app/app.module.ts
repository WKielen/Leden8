import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppNavModule } from './app-nav/app-nav.module';
import { MyPagesModule } from './my-pages/my-pages.module';

import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

import { AuthService } from './services/auth.service';
import { AuthGuard } from './services/auth.guard';
import { AdminAuthGuard } from './services/admin-auth-guard.service';
import { LedenService } from './services/leden.service';
import { ReadTextFileService } from './services/readtextfile.service';
import { AgendaService } from './services/agenda.service';
import { ParamService } from './services/param.service';
import { MailService } from './services/mail.service';
import { TrainingService } from './services/training.service';
import { NotificationService } from './services/notification.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptorService } from './services/token-interceptor.service';
import { ErrorHandler, LOCALE_ID } from '@angular/core';
import { AppErrorHandler } from './shared/error-handling/app-error-handler';
// Onderstaande 3 om bedragen in NL vorm weer te geven via pipe
import { registerLocaleData, APP_BASE_HREF, LocationStrategy, HashLocationStrategy } from '@angular/common';
import localeNl from '@angular/common/locales/nl';
// Material Date Locale hieronder toegevoegd voor Angular 9 conversie
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import {DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE} from '@angular/material/core';
import { ParentComponent } from './shared/components/parent.component';
import { AngularIbanModule } from 'angular-iban';

registerLocaleData(localeNl);


@NgModule({
  declarations: [
    AppComponent,
    ParentComponent,
  ],
  imports: [
    AppRoutingModule,
    AppNavModule,
    MyPagesModule,
    // Registratie van sw veranderd omdat we niet in de base href zitten maar in admin.
    // Note: if you are using a base-href in production, you’ll need to change the '/ngsw-worker.js' path to './ngsw-worker.js' to prevent a 404 error.
    ServiceWorkerModule.register('./ngsw-worker.js', { enabled: environment.production, registrationStrategy: 'registerImmediately' }),
    AngularIbanModule,
  ],

  providers: [AuthService,
    AuthGuard,
    AdminAuthGuard,
    LedenService,
    ReadTextFileService,
    {
      provide: APP_BASE_HREF,
      useValue: '/'
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
    },
    // Material Date Locale hieronder toegevoegd voor Angular 9 conversie
    { provide: MAT_DATE_LOCALE, useValue: 'nl-NL' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
