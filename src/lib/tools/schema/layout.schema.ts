import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './subschemas/rule'

export const schema = {
    type: 'object',
    properties: {
        uischemaType: {
            type:'string',
            enum: ['VerticalLayout','HorizontalLayout']
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


        /**
         * Tab - Base
         */
        {
            type: "Category",
            label: "Validation",
            elements: [
                {
                     scope: "#/properties/uischemaType",
                     type: "Control",
                }
            ],
            rule: {
                //effect: "DISABLE",:TODO fix it CategorizationRenderer
                effect: "HIDE",
                condition: {
                    scope: "#/properties/type",
                    schema: { enum: ["boolean"] }
                }
            }
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
} as Categorization|UISchemaElement;

