import { LedenItemExt } from "src/app/services/leden.service";
import { formatDate } from '@angular/common';

export function ReplaceKeywords(lid: LedenItemExt, body: string): string {

    body = Replace(body, /%voornaam%/gi, lid.Voornaam);
    body = Replace(body, /%tussen%/gi, lid.Tussenvoegsel);
    body = Replace(body, /%achternaam%/gi, lid.Achternaam);
    body = Replace(body, /%volledigenaam%/gi, lid.VolledigeNaam);
    body = Replace(body, /%naam%/gi, lid.Naam);
    body = Replace(body, /%adres%/gi, lid.Adres);
    body = Replace(body, /%postcode%/gi, lid.Postcode);
    body = Replace(body, /%woonplaats%/gi, lid.Woonplaats);
    body = Replace(body, /%telefoon%/gi, lid.Telefoon);
    body = Replace(body, /%mobiel%/gi, lid.Mobiel);
    body = Replace(body, /%email1%/gi, lid.Email1);
    body = Replace(body, /%email2%/gi, lid.Email2);
    body = Replace(body, /%geboortedatum%/gi, formatDate(lid.GeboorteDatum, 'dd-MM-yyyy', 'nl'));

    try {
        if (lid.LidTot != null) {
            body = Replace(body, /%lidtot%/gi, formatDate(lid.LidTot, 'dd MMMM yyyy', 'nl'));
        }
    }
    catch (err)
    {
        body = Replace(body, /%geboortedatum%/gi, lid.GeboorteDatum);
    }

    body = Replace(body, /%geslacht%/gi, lid.Geslacht);
    body = Replace(body, /%rekeningnummer%/gi, lid.IBAN);
    body = Replace(body, /%lidnr%/gi, lid.LidNr);
    body = Replace(body, /%bijzonderheden%/gi, lid.Medisch);
    body = Replace(body, /%lidtot%/gi, lid.LidTot);;
    body = Replace(body, /%volledigenaam%/gi, lid.VolledigeNaam);
    body = Replace(body, /%lidbond%/gi, String(lid.LidBond).toDutchTextString());
    body = Replace(body, /%compgerechtigd%/gi, String(lid.CompGerechtigd).toDutchTextString());
    body = Replace(body, /%naam%/gi, lid.Naam);
    body = Replace(body, /%vrijwregeling%/gi, lid.VrijwillgersRegelingIsVanToepassing);
    body = Replace(body, /%rating%/gi, lid.Rating);
    body = Replace(body, /%vastetaak%/gi, lid.VrijwillgersVasteTaak);
    body = Replace(body, /%leeftijdscategorie%/gi, lid.LeeftijdCategorieBond);
    body = Replace(body, /%leeftijd%/gi, lid.Leeftijd);
    body = Replace(body, /%iban%/gi, lid.IBAN);
    body = Replace(body, /%magopfoto%/gi, String(!lid.MagNietOpFoto).toDutchTextString());

    return body;
}


function Replace(body: string, re, to): string {
    // console.log('Replace', re, to);

    if (body === null || re === null || to === null) return;
    let tostring = '';
    if (typeof to === 'string') {
        tostring = to;
    }
    if (typeof to === 'number') {
        tostring = to.toString();
    }
    if (to instanceof Date) {
        tostring = to.toString();
    }
    if (to instanceof Boolean) {
        tostring = to.toDutchTextString();
    }

    return body.split(re).join(tostring);
}