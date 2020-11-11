import { Component, OnInit, OnDestroy, ViewChild } from "@angular/core";
import { MatSnackBar } from "@angular/material/snack-bar";
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { AuthService } from "src/app/services/auth.service";
import { LedenItem, LedenItemExt, LedenService } from 'src/app/services/leden.service';
import { ParamService } from 'src/app/services/param.service';
import { ParentComponent } from "src/app/shared/components/parent.component";
import { AppError } from 'src/app/shared/error-handling/app-error';

@Component({
  selector: "app-test",
  templateUrl: "./comp-admin.component.html",
  styleUrls: ["./comp-admin.component.scss"],
})
export class CompAdminComponent  extends ParentComponent implements OnInit {
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

@ViewChild(MatTable, { static: false }) table: MatTable<any>;
public dataSource = new MatTableDataSource<LidDifference>();
public columnsToDisplay: string[] = ['Naam', 'Verschil', 'actions1'];


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

}

/***************************************************************************************************
/ Vergelijk de ledenlijst van de bond met die van TTVN
/***************************************************************************************************/
onCompare(): void {
  this.dataSource = new MatTableDataSource<LidDifference>();

  for (let i_ttvn = 0; i_ttvn < this.ledenLijst.length; i_ttvn++) {
      let lid_ttvn = this.ledenLijst[i_ttvn];
      let lid_ttvn_in_nas: boolean = false;
      innerloop:
      for (let i_nas = 0; i_nas < this.nasLedenItems.length; i_nas++) {
          let lid_nas = this.nasLedenItems[i_nas];

          if (lid_ttvn.BondsNr == lid_nas['Bondsnr']) {
              lid_ttvn_in_nas = true;
              if (String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'N') {
                  this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in ttvn maar niet in NAS', lid_ttvn));
              }
              if (!String(lid_ttvn.CompGerechtigd).toBoolean() && lid_nas['CG'] == 'J') {
                  this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'CG: Wel in NAS maar niet in ttvn', lid_ttvn));
              }
              break innerloop;
          }
      }
      // Dit lid staat niet in NAS maar staat wel als zodanig in de administratie
      if (String(lid_ttvn.LidBond).toBoolean() && !lid_ttvn_in_nas) {
          this.dataSource.data.push(addToDifferenceList(lid_ttvn.Naam, 'LB: Wel in ttvn maar niet NAS', lid_ttvn));
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
          this.dataSource.data.push(addToDifferenceList(lid_nas['Naam'], 'LB: Wel in NAS niet in TTVN', null));
      }
  }
}

/***************************************************************************************************
/ Er is een verschil. Dit gaan we via een dialoog oplossen.
/***************************************************************************************************/
onEdit(index: number): void {

}

/***************************************************************************************************
/ We hebben een Nas export ingelezen. Deze gaan we in de DB bewaren
/***************************************************************************************************/
private addImportedNasLedenToDB(): void {
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
public lid: LedenItemExt;
}

function addToDifferenceList(name: string, message: string, lid: LedenItemExt): LidDifference {
let dif = new LidDifference();
dif.naam = name;
dif.verschil = message;
dif.lid = lid;
return dif;
}
