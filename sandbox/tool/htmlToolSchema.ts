import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import {JsonFormsInterface} from "../../src/lib/models";

export const schema = {
    type: 'object',
    properties: {
        options: {
            type: 'object',
            properties: {
                body: {
                    type:'string',
                },
            },
        },
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
    }
}

export const uischema = {

    "type": "Categorization",
    "elements": [
        {

            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    type:'Control',
                    scope:'#/properties/options/properties/body',
                    options: {
                        multi: true,
                    }
                },
            ]
        },
        {

            "type": "Category",
            "label": "Rule",
            "elements": [
                {
                    $ref:'rule.uischema'
                },
            ]
        },
    ]
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;

