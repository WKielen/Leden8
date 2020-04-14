import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LedenService, LedenItemExt, LedenItem } from '../../services/leden.service';
import { AppError } from '../../shared/error-handling/app-error';
import { DuplicateKeyError } from '../../shared/error-handling/duplicate-key-error';
import { SnackbarTexts } from 'src/app/shared/error-handling/SnackbarTexts';
import { ParentComponent } from 'src/app/shared/components/parent.component';
import { read, write, utils, WorkBook } from 'xlsx'
import { ParamService } from 'src/app/services/param.service';
import { AuthService } from 'src/app/services/auth.service';
import { NotFoundError } from 'src/app/shared/error-handling/not-found-error';
import { NoChangesMadeError } from 'src/app/shared/error-handling/no-changes-made-error';

@Component({
    selector: 'app-syncnttb-page',
    templateUrl: './syncnttb.component.html',
    styleUrls: ['./syncnttb.component.scss']
})

// De XLS upload zit in een externe package 'xlsx'

export class SyncNttbComponent extends ParentComponent implements OnInit {

    constructor(private ledenService: LedenService,
        private paramService: ParamService,
        private authService: AuthService,
        protected snackBar: MatSnackBar,
    ) {
        super(snackBar)
    }

    // nasLedenItems = new NasLedenList();
    private nasLedenItems = [];
    private ledenLijst: LedenItemExt[] = [];
    public ledenDifferences: LidDifference[] = [];
    public columnsToDisplay: string[] = ['Naam', 'Verschil'];

    ngOnInit(): void {
        this.readNasLedenLijst();
        this.readLedenLijst();
    }

    /***************************************************************************************************
    / Lees het bewaard mail overzicht uit de Param tabel
    /***************************************************************************************************/
    private readNasLedenLijst(): void {
        let sub = this.paramService.readParamData$('nasLedenlijst' + this.authService.userId, JSON.stringify([]), 'NAS Ledenlijst' + this.authService.userId)
            .subscribe(data => {
                this.nasLedenItems = JSON.parse(data as string) as any;;
            },
                (error: AppError) => {
                    console.log("error", error);
                }
            )
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Lees TTVN Ledenlijst uit DB
    /***************************************************************************************************/
    private readLedenLijst(): void {
        let sub = this.ledenService.getActiveMembers$()
            .subscribe((data: Array<LedenItem>) => {
                this.ledenLijst = data;
                this.onCompare();
            });
        this.registerSubscription(sub);
    }

    /***************************************************************************************************
    / Importeer de NAS ledenlijst
    /***************************************************************************************************/
    async onClickLedenLijstImport(): Promise<void> {

        let fileReader = new FileReader();
        let arrayBuffer: any;
        fileReader.onload = (e) => {
            arrayBuffer = fileReader.result;
            var data = new Uint8Array(arrayBuffer);
            var arr = new Array();
            for (var i = 0; i != data.length; ++i) arr[i] = String.fromCharCode(data[i]);
            var bstr = arr.join("");
            var workbook = read(bstr, { type: "binary" });
            var first_sheet_name = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[first_sheet_name];
            this.nasLedenItems = utils.sheet_to_json(worksheet, { raw: true });
            // console.log('this.nasLedenItems.NasLedenItems', this.nasLedenItems.NasLedenItems);

            if (this.nasLedenItems.length > 0) {
                this.addImportedNasLedenToDB();
            }
            else {
                this.showSnackBar('De geimporteerde ledenlijst is niet goed.', '');
            }
            this.onCompare();
        }
        fileReader.readAsArrayBuffer(this.selectedFile);
    }

    /***************************************************************************************************
    / Vergelijk de ledenlijst van de bond met die van TTVN
    /***************************************************************************************************/
    onCompare(): void {
        this.ledenDifferences = [];

        for (let i_ttvn = 0; i_ttvn < this.ledenLijst.length; i_ttvn++) {
            let lid_ttvn = this.ledenLijst[i_ttvn];
            let lid_ttvn_in_nas: boolean = false;
            innerloop:
            for (let i_nas = 0; i_nas < this.nasLedenItems.length; i_nas++) {
                let lid_nas = this.nasLedenItems[i_nas];

                if (lid_ttvn.BondsNr == lid_nas['Bondsnr']) {
                    lid_ttvn_in_nas = true;
                    if (String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'N') {
                        this.ledenDifferences.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in ttvn maar niet in NAS'));
                    }
                    if (String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'J') {
                        this.ledenDifferences.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in NAS maar niet in ttvn'));
                    }
                    break innerloop;
                }
            }
            // Dit lid staat niet in NAS maar staat wel als zodanig in de administratie
            if (String(lid_ttvn.LidBond).toBoolean() && !lid_ttvn_in_nas) {
                this.ledenDifferences.push(addToDifferenceList(lid_ttvn.Naam, 'LB: Wel in ttvn maar niet NAS'));
            }
        }


        for (let i_nas = 0; i_nas < this.nasLedenItems.length; i_nas++) {
            let lid_nas = this.nasLedenItems[i_nas];
            let lid_nas_in_ttvn: boolean = false;
            innerloop:
            for (let i_ttvn = 0; i_ttvn < this.ledenLijst.length; i_ttvn++) {
                let lid_ttvn = this.ledenLijst[i_ttvn];
                if (lid_ttvn.BondsNr == lid_nas['Bondsnr']) {

                    lid_nas_in_ttvn = true;
                    break innerloop;
                }
            }

            if (!lid_nas_in_ttvn) {
                this.ledenDifferences.push(addToDifferenceList(lid_nas['Naam'], 'LB: Wel in NAS niet in TTVN'));
            }
        }
        console.log('ledenDif', this.ledenDifferences);
    }

    /***************************************************************************************************
    / We hebben een Nas export ingelezen. Deze gaan we in de DB bewaren
    /***************************************************************************************************/
    private addImportedNasLedenToDB(): void {
        // console.log('this.nasLedenItems', JSON.stringify(this.nasLedenItems));

        this.paramService.saveParamData$('nasLedenlijst' + this.authService.userId,
            JSON.stringify(this.nasLedenItems),
            'NAS Ledenlijst' + this.authService.userId)
            .subscribe(data => {
                this.showSnackBar(SnackbarTexts.SuccessFulSaved, '');
            },
                (error: AppError) => {
                    if (error instanceof NotFoundError) {
                        this.showSnackBar(SnackbarTexts.NotFound, '');
                    }
                    else if (error instanceof DuplicateKeyError) {
                        this.showSnackBar(SnackbarTexts.DuplicateKey, '');

                    }
                    else if (error instanceof NoChangesMadeError) {
                        this.showSnackBar(SnackbarTexts.NoChanges, '');
                    }
                    else {
                        this.showSnackBar(SnackbarTexts.UpdateError, '');
                    }
                });
    }

    /***************************************************************************************************
    / 
    /***************************************************************************************************/
    selectedFile: File = null;
    uploadFileName: string = '';

    onFileSelected(fileList: FileList): void {
        this.selectedFile = fileList[0];
        this.uploadFileName = this.selectedFile.name;
    }
}

/***************************************************************************************************
/ Difference between out admin and the NTTB admin
/***************************************************************************************************/
export class LidDifference {
    public naam: string = '';
    public verschil: string = '';
}

function addToDifferenceList(name: string, message: string): LidDifference {
    let dif = new LidDifference();
    dif.naam = name;
    dif.verschil = message;
    return dif;
}
