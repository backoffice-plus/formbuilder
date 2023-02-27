import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: "object",

    definitions: {
        additionalPropertiesFalse: {
            //const: false,
            type:'boolean',
            title:'by boolean',
        },
        additionalProperties: {
            type: "object",
            title:'by type',
            properties: {
                type: {
                    type: "string",
                    enum: ['string','number','integer','boolean','array']
                },
                title: {
                    type: "string"
                },
            },
            required: ['type']
        }
    },

    properties: {
        propertyName: {
            type: "string"
        },
        required: {
            type: "boolean"
        },
        schema: {
            type:'object',
            properties: {
                additionalProperties: {
                    oneOf: [
                        {$ref:'#/definitions/additionalPropertiesFalse'},
                        {$ref:'#/definitions/additionalProperties'},
                    ]
                },
                patternProperties: {
                    type: "object",
                    additionalProperties: {
                        type: 'object',
                        properties: {
                            type: {
                                type: "string",
                                enum: ['string','number','integer','boolean','array']
                            }
                        },
                    }
                }
            }
        }
    },
    required: [
        "propertyName"
    ]
} as JsonSchema

export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    "type": "HorizontalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/propertyName",
                            "type": "Control"
                        },
                    ],
                },


                {
                    "scope": "#/properties/schema/properties/additionalProperties",
                    "type": "Control"
                },
                {
                    "scope": "#/properties/schema/properties/patternProperties",
                    "type": "Control"
                },
            ]
        },

    ]
} as UISchemaElement|Categorization
