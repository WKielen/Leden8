export interface IDictionary {
    add(key: string, value: any): void;
    remove(key: string): void;
    containsKey(key: string): boolean;
    keys(): string[];
    values(): any[];
}

export class Dictionary {
    protected _keys: string[] = [];
    protected _values: any[] = [];
    constructor(init: {
        key: string;
        value: any;
    }[]) {
        for (var x = 0; x < init.length; x++) {
            this[init[x].key] = init[x].value;
            this._keys.push(init[x].key);
            this._values.push(init[x].value);
        }
    }
    ;
    add(key: string, value: any) {
        this[key] = value;
        this._keys.push(key);
        this._values.push(value);
    }
    remove(key: string) {
        var index = this._keys.indexOf(key, 0);
        this._keys.splice(index, 1);
        this._values.splice(index, 1);
        delete this[key];
    }
    get(key:string) {
        const index = this._keys.indexOf(key, 0);
        return this._values[index];
    }
    set(key: string, value: any) {
        const index = this._keys.indexOf(key, 0);
        this._values[index] = value;
    }
    keys(): string[] {
        return this._keys;
    }
    values(): any[] {
        return this._values;
    }
    length(): number {
        return this._keys.length;
    }
    containsKey(key: string) {
        if (typeof this[key] === "undefined") {
            return false;
        }
        return true;
    }
    toLookup(): IDictionary {
        return this;
    }
}
