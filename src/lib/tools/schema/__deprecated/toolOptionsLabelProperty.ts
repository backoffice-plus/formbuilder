import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {JsonFormsInterface} from "../../../models";

export const schema = {
    "type": "object",
    "properties": {
        "label": {
            "type": "string"
        },
        i18n: {
            type: "string",
        },
    },
}

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
                            "scope": "#/properties/label",
                            "type": "Control"
                        },
                    ],
                },
                {
                    scope: "#/properties/i18n",
                    type: "Control",
                    label: 'i18n key',
                    description: "alternative lookup key for translation catalogue",
                },
            ]
        },

    ]
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;
