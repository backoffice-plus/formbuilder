import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: "object",
    properties: {
        propertyName: {
            type: "string"
        },
        keyword: {
            type: "string",
            enum: ['oneOf', 'anyOf', 'allOf'],
        }
    },
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
                    "scope": "#/properties/keyword",
                    "type": "Control"
                },
            ]
        },

    ]
} as UISchemaElement|Categorization
