import type {Categorization, Category, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './subschemas/labelAndI18n'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './subschemas/rule'

export const schema = {
    type: 'object',
    properties: {
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
        labelAndI18n: {
            $ref:'labelAndI18n.schema#/properties/labelAndI18n'
        },
        styles: {
            $ref:'styles.schema#/properties/styles'
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
                            $ref:'labelAndI18n.uischema'
                        },
                    ],
                }
            ]
        },


        /**
         * Tab - Styles
         */
        {
            type: "Category",
            label: "Styles",
            elements: [
                {
                    $ref:'styles.uischema'
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
} as Categorization|UISchemaElement;

