import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../models";

export type schemaKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength';
export const schemaKeys = ['minimum', 'maximum', 'pattern', 'minLength', 'maxLength'] as Array<schemaKey>;

export const prepareOptionData = (schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) {
            data[key] = schema[key]
        }
    });

    return {validation: data};
}

export const setOptionData = (schema: JsonSchema, uischema: UISchemaElement, data: Record<string, any>): void => {
    schemaKeys.forEach(key => {
        if (undefined !== data.validation[key]) {
            schema[key] = data.validation[key]
        }
    });
}


export const schema = {
    type: "object",
    properties: {
        validation: {
            type: "object",
            properties: {
                maximum: {
                    type: "number"
                },
                minimum: {
                    type: "number"
                },
                minLength: {
                    "type": "number"
                },
                maxLength: {
                    "type": "number"
                },
                pattern: {
                    "type": "string",
                    description: "for examples: \"[abc]+\""
                },
            }
        },
    },
}

export const uischema = {
    "type": "VerticalLayout",
    "elements": [
        {
            "type": "HorizontalLayout",
            "elements": [
                {
                    "scope": "#/properties/validation/properties/minimum",
                    "type": "Control"
                },
                {
                    "scope": "#/properties/validation/properties/maximum",
                    "type": "Control"
                },
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/type",
                    "schema": {enum: ["number", "integer"]}
                }
            }
        },
        {
            "type": "HorizontalLayout",
            "elements": [
                {
                    "scope": "#/properties/validation/properties/minLength",
                    "type": "Control"
                },
                {
                    "scope": "#/properties/validation/properties/maxLength",
                    "type": "Control"
                },
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/type",
                    "schema": {enum: ["string"]}
                }
            }
        },
        {
            "scope": "#/properties/validation/properties/pattern",
            "type": "Control",
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/type",
                    "schema": {enum: ["string"]}
                }
            }
        },
    ],
}

export const jsonForms = {schema: schema as JsonSchema, uischema: uischema as UISchemaElement} as JsonFormsInterface;
