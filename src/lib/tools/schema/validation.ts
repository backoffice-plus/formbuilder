import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../models";

export type schemaKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength' | 'minItems' | 'maxItems' | 'uniqueItems';
export const schemaKeys = ['minimum', 'maximum', 'pattern', 'minLength', 'maxLength', 'minItems', 'maxItems', 'uniqueItems'] as Array<schemaKey>;

export const prepareOptionData = (schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) {
            data[key] = schema[key]
        }
    });

    return {validation: data};
}

export const setOptionData = (schema: JsonSchema|any, uischema: UISchemaElement, data: Record<string, any>): void => {
    schemaKeys.forEach((key) => {
        schema[key] = data?.validation[key]
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


                //array
                minItems: {
                    type: "integer"
                },
                maxItems: {
                    type: "integer"
                },
                uniqueItems: {
                    type: "boolean"
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


        {
            "type": "VerticalLayout",
            "elements": [
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/validation/properties/minItems",
                            "type": "Control"
                        },
                        {
                            "scope": "#/properties/validation/properties/maxItems",
                            "type": "Control"
                        },
                    ],
                },
                {
                    "scope": "#/properties/validation/properties/uniqueItems",
                    "type": "Control"
                },
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/type",
                    "schema": {enum: ["array"]}
                }
            }
        },


    ],
}

export const jsonForms = {schema: schema as JsonSchema, uischema: uischema as UISchemaElement} as JsonFormsInterface;
