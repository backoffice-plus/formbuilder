import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: "object",
    properties: {
        propertyName: {
            type: "string"
        },
        required: {
            type: "boolean"
        },
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
            ]
        },

    ]
} as UISchemaElement|Categorization
