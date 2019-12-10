/***************************************************************************************************
/ Wordt gebruik voor het tellen van de leden per categorie
/***************************************************************************************************/
import { Dictionary } from "./Dictionary";

export class CountingValues extends Dictionary {

    public Increment(Key: string): void {
        if (this.containsKey(Key)) {
            this.set(Key, this.get(Key) + 1) 
        } else {
            this.add(Key, 1);
        }
    }
}
