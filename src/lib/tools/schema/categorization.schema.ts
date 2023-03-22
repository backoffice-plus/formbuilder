import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: 'object',
    properties: {
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
        styles: {
            $ref:'styles.schema#/properties/styles'
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

