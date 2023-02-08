import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

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
         * Tab - Category
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

