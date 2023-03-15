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


        /**
         * Tab - Rule
         */
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

