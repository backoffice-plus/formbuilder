import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../../models";
import type {ToolContext} from "../../index";

export const schemaKeysString = ['minLength', 'maxLength', 'pattern'] as Array<string>;
export const schemaKeysNumber = ['minimum', 'maximum', 'multipleOf', 'exclusiveMinimum', 'exclusiveMaximum'] as Array<string>;
export const schemaKeys = [...schemaKeysString, ...schemaKeysNumber, 'minItems', 'maxItems', 'uniqueItems'] as Array<string>;

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        /* @ts-ignore */
        if (undefined !== schema[key]) {
            /* @ts-ignore */
            data[key] = schema[key]
        }
    });

    return {validation: data};
}

export const setOptionData = (schema: JsonSchema|any, uischema: UISchemaElement, data: Record<string, any>): void => {
    schemaKeys.forEach((key) => {
        schema[key] = data?.validation[key]
        if(undefined === schema[key]) {
            delete schema[key];
        }
    });
}


export const schema = {
    type: "object",
    properties: {
        validation: {
            type: "object",
            properties: {

                //number
                maximum: { type: "number" },
                minimum: {type: "number"},
                multipleOf: {type: "number"},
                exclusiveMinimum: {type: "number"},
                exclusiveMaximum: {type: "number"},


                //string
                minLength: {
                    type: "integer"
                },
                maxLength: {
                    type: "integer"
                },
                pattern: {
                    "type": "string",
                    format: 'regex',
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
            /**
             * Number
             */
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
                },
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/validation/properties/exclusiveMinimum",
                            "type": "Control"
                        },
                        {
                            "scope": "#/properties/validation/properties/exclusiveMaximum",
                            "type": "Control"
                        },
                    ],
                },
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/validation/properties/multipleOf",
                            "type": "Control"
                        },
                    ],
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
