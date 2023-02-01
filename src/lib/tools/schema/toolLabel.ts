import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: 'object',
    properties: {
        text: {
            type: 'string',
        },
        i18n: {
            type: 'string',
        },
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
    }
} as JsonSchema;

export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    "type": "VerticalLayout",
                    "elements": [
                        {
                            scope: "#/properties/text",
                            type: "Control",
                        },
                        {
                            scope: "#/properties/i18n",
                            type: "Control"
                        },
                    ],
                }
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
} as  Categorization|UISchemaElement;

