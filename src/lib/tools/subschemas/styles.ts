import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {ToolContext} from "../../models";
import * as _ from 'lodash-es'
import {flatten, unflatten} from "flat";

export const prepareOptionData = (context:ToolContext, schema:JsonSchema, uischema:UISchemaElement) : Record<string, any> => {
    const styles = uischema?.options?.styles;

    const fl = styles && flatten(styles) as any;
    const stylesAsArray = fl && Object.keys(fl).map(key => {
        return {'path':key,'class':fl[key]}
    })

    return {styles:{stylesAsArray:stylesAsArray ?? []}};
}

export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {

    const stylesAsArray = data?.styles?.stylesAsArray;

    if(stylesAsArray) {
        const fl = {} as any;
        stylesAsArray.forEach((item:any) => {
            fl[item.path] = item.class;
        })
        _.set(uischema,'options.styles',unflatten(fl))
    }

    if(uischema?.options?.styles && _.isEmpty(uischema.options.styles)) {
        delete uischema.options.styles
    }
}
