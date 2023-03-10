import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: 'object',
    properties: {
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
    }
} as JsonSchema;

export const uischema = {

    type: "Categorization",
    elements: [


        /**
         * Tab - Base
         */
        {
            type: "Category",
            label: "Base",
            elements: [

            ],
        },



        /**
         * Tab - Rule
         */
        {
            type: "Category",
            label: "Rule",
            elements: [
                {
                    $ref:'rule.uischema'
                },
            ]
        },
    ]
} as Categorization|UISchemaElement;

