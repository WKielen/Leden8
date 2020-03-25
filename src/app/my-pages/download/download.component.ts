import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { LedenService, LedenItemExt, LedenItem, LidTypeValues } from '../../services/leden.service';
import { ExportToCsv } from 'export-to-csv';
import { DynamicDownload } from 'src/app/shared/modules/DynamicDownload';
import { AgendaService } from 'src/app/services/agenda.service';
import * as moment from 'moment';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { ReplaceKeywords } from 'src/app/shared/modules/ReplaceKeywords';
import { ReadTextFileService } from 'src/app/services/readtextfile.service';
import { CheckImportedAgenda, AddImportedAgendaToDB } from 'src/app/shared/modules/AgendaRoutines';

@Component({
    selector: 'app-download-page',
    templateUrl: './download.component.html',
    styleUrls: ['./download.component.scss']
})

// De CSV download is een externe package 'export-to-csv
// De TXT download zit in common en is afgeleid van een voorbeeld. Dit voorbeeld kan overigens ook JSON.

export class DownloadComponent extends ParentComponent implements OnInit {
    csvOptions = {
        fieldSeparator: ';',
        quoteStrings: '"',
        decimalSeparator: ',',
        showLabels: true,
        showTitle: false,
        title: 'Ledenlijst',
        useTextFile: false,
        useBom: true,
        useKeysAsHeaders: true,
        filename: ''
        // headers: ['Column 1', 'Column 2', etc...] <-- Won't work with useKeysAsHeaders present!
    };

    ledenLijstKeuzes: string[] = ['Volledig', 'E-Mail'];
    ledenLijstKeuze: string = this.ledenLijstKeuzes[0];
    ledenSelectieKeuzes: string[] = ['Alle Leden', 'Volwassenen', 'Jeugd'];
    ledenSelectieKeuze: string = this.ledenSelectieKeuzes[0];
    ledenArray: LedenItemExt[] = [];
    selectedLid: LedenItemExt;
    vcard: string = '';

    constructor(private ledenService: LedenService,
        private agendaService: AgendaService,
        public readTextFileService: ReadTextFileService,
        protected snackBar: MatSnackBar,
    ) {
        super(snackBar)
    }

    ngOnInit(): void {
        this.registerSubscription(
            this.ledenService.getActiveMembers$()
                .subscribe((data: Array<LedenItemExt>) => {
                    this.ledenArray = data;
                }));

        this.registerSubscription(
            this.readTextFileService.read('templates/template_vcard.txt')
                .subscribe(data => {
                    this.vcard = data;
                }
                ));
    }

    /***************************************************************************************************
    / Download button in Download Ledenlijst box
    /***************************************************************************************************/
    onClickLedenLijst(): void {
        switch (this.ledenLijstKeuze) {
            case this.ledenLijstKeuzes[0]: {  // Ledenlijst
                this.createLedenlijst();
                break;
            }
            case this.ledenLijstKeuzes[1]: {  // Create Mail
                this.createMailLijst();
                break;
            }
            default: {
                this.showSnackBar(SnackbarTexts.SevereError, '');
            }
        }
    }

    /***************************************************************************************************
    / Download ledenlijst
    /***************************************************************************************************/
    private async createLedenlijst(): Promise<void> {
        let localList: LedenItemExt[] = [];
        // let ledenArray: LedenItemExt[] = await this.readLedenLijst();

        switch (this.ledenSelectieKeuze) {
            case this.ledenSelectieKeuzes[0]: {  // Alle Leden
                localList = this.ledenArray;
                this.csvOptions.filename = "TTVN Ledenlijst ";
                break;
            }
            case this.ledenSelectieKeuzes[1]: {   // Alleen volwassenen
                this.ledenArray.forEach((element: LedenItemExt) => {
                    if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.ADULT) {
                        localList.push(element);
                    }
                });
                this.csvOptions.filename = "TTVN Volwassenenlijst ";

                break;
            }
            case this.ledenSelectieKeuzes[2]: {  // Alleen jeugd
                this.ledenArray.forEach((element: LedenItemExt) => {
                    if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.YOUTH) {
                        localList.push(element);
                    }
                });
                this.csvOptions.filename = "TTVN Jeugdlijst ";
                break;
            }
            default: {
                this.showSnackBar(SnackbarTexts.SelectionError, '');
            }
        }

        this.csvOptions.filename += new Date().to_YYYY_MM_DD();
        let csvExporter = new ExportToCsv(this.csvOptions);
        csvExporter.generateCsv(localList);
    }

    /***************************************************************************************************
    / Download maillijst
    /***************************************************************************************************/
    async createMailLijst(): Promise<void> {
        let localList: string = '';
        let fileName: string = '';
        //let ledenArray: LedenItemExt[] = await this.readLedenLijst();
        switch (this.ledenSelectieKeuze) {
            case this.ledenSelectieKeuzes[0]: {  // Alle Leden
                this.ledenArray.forEach((element: LedenItemExt) => {
                    const emailList = LedenItem.GetEmailList(element);
                    emailList.forEach(element => {
                        localList += element + ';';
                    });
                });
                fileName = "TTVN Leden Maillijst ";
                break;
            }
            case this.ledenSelectieKeuzes[1]: {  // Alle Volwassenen
                this.ledenArray.forEach((element: LedenItemExt) => {
                    if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.ADULT) {
                        const emailList = LedenItem.GetEmailList(element);
                        emailList.forEach(element => {
                            localList += element + ';';
                        });
                    }
                });
                fileName = "TTVN Volwassenen Maillijst ";

                break;
            }
            case this.ledenSelectieKeuzes[2]: {  // Alle Jeugd
                this.ledenArray.forEach((element: LedenItemExt) => {
                    if (element.LeeftijdCategorieWithSex.charAt(0) == LidTypeValues.YOUTH) {
                        const emailList = LedenItem.GetEmailList(element);
                        emailList.forEach(element => {
                            localList += element + ';';
                        });
                    }
                });
                fileName = "TTVN Jeugd Maillijst ";
                break;
            }
            default: {
                this.showSnackBar(SnackbarTexts.SelectionError, '');
            }
        }
        let dynamicDownload = new DynamicDownload();
        fileName += new Date().to_YYYY_MM_DD();
        dynamicDownload.dynamicDownloadTxt(localList, fileName, 'txt');
        // dynamicDownload.dynamicDownloadJson(ledenArray, fileName); Voorbeeld voor JSON export
    }

    //***************************************************************************************************/
    //                                                                                                  */  
    //       Agenda functions
    //                                                                                                  */  
    //***************************************************************************************************/

    /***************************************************************************************************
    / Exporteer de agenda
    /***************************************************************************************************/
    formats = [moment.ISO_8601, 'DD-MM-YYYY', 'D-MM-YYYY', 'DD-M-YYYY', 'D-M-YYYY'];  // 

    async onClickAgendaLijst(): Promise<void> {
        let agendaArray = await this.readAgendaLijst();
        this.csvOptions.filename = "TTVN Agenda " + new Date().to_YYYY_MM_DD();
        let csvExporter = new ExportToCsv(this.csvOptions);
        csvExporter.generateCsv(agendaArray);
    }

    /***************************************************************************************************
    / Importeer een agenda bestand, controleer het en schrijf het naar de DB
    /***************************************************************************************************/
    async onClickAgendaImport(): Promise<void> {
        let contents = await this.readFileAsText(this.selectedFile);
        let agendaItems = CheckImportedAgenda(contents as string);

        if (agendaItems != null) {
            AddImportedAgendaToDB(agendaItems);
        }
        else {
            this.showSnackBar('De geimporteerde agenda is niet goed.', '');
        }
    }

    /***************************************************************************************************
    / De call wordt SYNC gedaan omdat anders het output betand al wordt gemaakt terwijl de input er nog niet is
    /***************************************************************************************************/
    async readFileAsText(file) {
        let result = await new Promise((resolve) => {
            let fileReader = new FileReader();
            fileReader.onload = (e) => resolve(fileReader.result as string);
            fileReader.readAsText(file);
        });
        return result;
    }

    selectedFile: File = null;
    uploadFileName: string = '';

    /***************************************************************************************************
    / Er wordt een input betand geselecteerd voor de agenda
    /***************************************************************************************************/
    onFileSelected(fileList: FileList): void {
        this.selectedFile = fileList[0];
        this.uploadFileName = this.selectedFile.name;
    }

    /***************************************************************************************************
    / De call wordt SYNC gedaan omdat anders het output betand al wordt gemaakt terwijl de input er nog niet is
    /***************************************************************************************************/
    readAgendaLijst(): Promise<Object> {
        // -------------------------------------------------------- :o)
        return this.agendaService.getAll$()
            .toPromise()
            .then(response => {
                return response
            });
        // -------------------------------------------------------- :o)
    }

    /***************************************************************************************************
    / Kies een lid voor het aanmaken van een VCard
    /***************************************************************************************************/
    onUserSelected(lid): void {
        this.selectedLid = lid;
    }

    /***************************************************************************************************
    / Creeer een bestand dat kan worden ingelezen als contact in android of apple
    /***************************************************************************************************/
    onCreateVcard(): void {
        let vcardt = ReplaceKeywords(this.selectedLid, this.vcard);
        let dynamicDownload = new DynamicDownload();
        let fileName = 'Vcard_' + this.selectedLid.VolledigeNaam.split(' ').join('_');
        dynamicDownload.dynamicDownloadTxt(vcardt, fileName, 'vcf');
    }

}
