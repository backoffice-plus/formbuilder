import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../../models";
import type {ToolContext} from "../../index";
import _ from "lodash";
/** @ts-ignore */
import flatten, {unflatten} from "flat";

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

export const schema = {

    type: "object",

    properties: {

        styles: {
            type: 'object',
            properties: {
                stylesAsArray: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            path: {
                                type: "string",
                                //description: "like control.textarea"
                            },
                            class: {
                                type: "string",
                                //description: " "
                            }
                        }
                    }
                }
            }
        },
    },
}

export const uischema = {

    scope: "#/properties/styles/properties/stylesAsArray",
    type: "Control",
    options: {
        detail:  {
            "type": "HorizontalLayout",
            "elements": [
                {
                    "type": "Control",
                    "scope": "#/properties/path"
                },
                {
                    "type": "Control",
                    "scope": "#/properties/class",
                    "options": {
                        "multi": true
                    }
                }
            ]
        }
    }

}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;
