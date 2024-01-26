import {composeWithUi, toDataPath, toDataPathSegments} from "@jsonforms/core";
import type {Scopable} from "@jsonforms/core";


export class PropertyName {

    constructor(public name: string) {
    }

    /**
     * return person.name
     */
    toDataPath():string {
        return toDataPath('#/properties/person/properties/name');
    }

    composeWithUi():string {
        return composeWithUi({scope:'#/properties/name'} as Scopable, 'person')
    }

    toDataPathSegments():string[] {
        return toDataPathSegments('#/properties/name');
    }
}
