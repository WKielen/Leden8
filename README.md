# Leden

This project was generated with version 8


# Conversion script to version 8

npm install @angular/cli
ng add @angular/pwa --project Leden
ng add @angular/material

npm install --save @ng-bootstrap/ng-bootstrap      // lijkt overbodig
npm install --save @angular/flex-layout
npm install --save @auth0/angular-jwt
npm install --save moment
npm install --save export-to-csv
npm install --save web-push
npm install --save xlsx
npm install --save angular-iban         // werkt niet meer

assets kopieren
inhoud environment files kopieren
favicon kopieren
index.html body gekopieerd. --> webmanifest later bekijken.
main.ts  import extensions gekopieerd

inhoud manifest.json gekopieerd naar manifest.webmanifest
inhoud styles.scss toegevoegd aan styles.scss
inhoud van alternative-theme gekopieerd in styles.scss

folders gekopieerd:
- src/app/app-nav
- src/app/common
- src/app/components
- src/app/my-pages
- src/app/services

Fix alle @ViewChild(xyz) -->  @ViewChild(xyz, {static: false})

Inhoud overgezet:
- app-routing.module.ts
- app.component.css
- app.component.ts
- app.component.html
- app.module.ts
material.module.ts gekopieerd

NgbModule.forRoot() uit app.module.ts verwijderd
in app.component.ts   css --> scss

------------------------------
ERROR in ./node_modules/angular-iban/fesm2015/angular-iban.js
Module not found: Error: Can't resolve 'iban' in 'D:\Leden8\Leden\node_modules\angular-iban\fesm2015'
i ｢wdm｣: Failed to compile.
-----------------------------------------
referenties naar angular-iban verwijderd


geeft nog een warning: 
------------------------------
Current document does not have a doctype. This may cause some Angular Material components not to behave as expected.
----------------------- oorzaak??? 

NgbModule.forRoot(), uit app.modules.ts verwijderd


Awesome fonts toegevoegd aan index.html
  <link  href="https://use.fontawesome.com/releases/v5.1.0/css/all.css" rel="stylesheet">




# run in production mode
ng build --prod
http-server -p 8080 -c-1 dist/leden

Omdat het path naar de service-worker altijd naar 'app' wijst. (Lokatie op productie) moet de 
ngsw-worker.js en ngsw.json naar de 'app' folder worden gekopieerd om de service worker te laten werken. 
 manifest.webmanifest "start_url": "/index.html",   /app toevoegen
  index.html  <base href="/">  moet /app/ zijn







# Leden

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 6.0.8.


### Generate component is anders omdat we een module material.modules.ts hebben
`ng g c naam  --module=../app.module`

### Prerequisites

What things you need to install the software and how to install them

install:
* NodeJs via nodejs.org
* Angular CLI  `npm install -g @angular/cli` 
* Typescript `npm install -g typescript`

```
Het project is alsvolgt gemaakt:

* ng new my-app --service-worker --routing

* npm install --save @angular/material @angular/cdk
* npm install --save @angular/animations

* npm install --save @ng-bootstrap/ng-bootstrap
* npm install --save @angular/flex-layout

* npm install --save @auth0/angular-jwt
* npm install --save moment

* npm install --save export-to-csv
* npm install --save angular-iban iban       from https://www.npmjs.com/package/angular-iban

* npm install web-push -g                    look at https://blog.angular-university.io/angular-push-notifications/


```


## Progressive Web App

This app has PWA on board. Please allways checkout the service-worker config `ngsw-config.json` when you change the API url or fonts url's.

Run `http-server -p 8080 -c-1 dist/ttvn -o` for the production version with pwa

## Build for production

Run `ng build --prod --base-href=/app/` for the production build


## Development server


Run `ng serve --base-href=/app/` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI README](https://github.com/angular/angular-cli/blob/master/README.md).
