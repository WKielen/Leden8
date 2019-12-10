/***************************************************************************************************
/ In deze class sla ik per lid alle berekende bedragen op en alle params die zijn gebruikt.
/ Dit wordt gebruikt voor het download overzicht. Ieder property wordt een kolom in de CSV
/***************************************************************************************************/
export class BerekeningOverzicht {

    LidNr: number = 0;
    VolledigeNaam: string = '';
    LeeftijdCategorie: string = '';
    GeboorteDatum?: Date;
    BetaalWijze?: string = '';
    LidBond?: string = '';
    CompGerechtigd?: string = '';
    LidType?: string = '';
    VastBedrag?: number = 0;
    Korting?: number = 0;
    VrijwilligersKorting?: string = '';

    BerekendeBasisContributie: number = 0;
    BerekendeCompetitieBijdrage: number = 0;
    BerekendeBondsbijdrage: number = 0;
    BerekendeHalfjaarBondBijdrage: number = 0;
    BerekendeKortingVrijwilliger: number = 0;
    BerekendeKostenRekening: number = 0;
    BerekendeEindBedrag: number = 0;
    Omschrijving: string = '';

    HalfjaarVolwassenen: number = 0;
    HalfjaarJeugd: number = 0;
    CompetitieBijdrageVolwassenen: number = 0;
    CompetitieBijdrageJeugd: number = 0;
    HalfjaarBondBijdrage: number = 0;
    ZwerflidPercentage: number = 0;
    KostenRekening: number = 0;
    KortingVrijwilliger: number = 0;

}