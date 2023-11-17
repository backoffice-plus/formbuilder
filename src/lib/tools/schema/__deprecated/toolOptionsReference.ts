import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";

export const schema = {
    type: "object",
    definitions: {
        refString: {
            type: "string",
            title: "Reference",
            description: "#/definitions/NAME",
        },
    },
    properties: {
        propertyName: {
            type: "string"
        },
        _reference: {
            anyOf: [
                {$ref:'referenceTool.definitions',title:"asdasd"},
                {$ref:'#/definitions/refString'},
            ],
        }
    },
} as JsonSchema;

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
                    "scope": "#/properties/_reference",
                    "type": "Control",
                    "label": "Reference to Definitions",
                },
            ]
        },

    ]
} as Categorization|UISchemaElement;
