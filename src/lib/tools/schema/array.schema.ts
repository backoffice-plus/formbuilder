import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: 'object',
    properties: {

        validation: {
            $ref:'validation.schema#/properties/validation'
        },
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
        labelAndI18n: {
            $ref:'labelAndI18n.schema#/properties/labelAndI18n'
        },


        propertyName: {
            type: "string"
        },
        singleChild: {
            type: "boolean"
        },
        options: {
            type: "object",
            properties: {
                elementLabelProp: {
                    type: "string"
                },
            }
        },
    },

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
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            scope: "#/properties/propertyName",
                            type: "Control"
                        },
                        {
                            scope: "#/properties/singleChild",
                            type: "Control"
                        },
                        {
                            scope: "#/properties/options/properties/elementLabelProp",
                            type: "Control",
                        },
                        {
                            type: "Group",
                            label: "Label & Description",
                            elements: [
                                {
                                    $ref:'labelAndI18n.uischema'
                                },
                            ]
                        },
                    ],
                }
            ]
        },


        /**
         * Tab - Validation
         */
        {
            type: "Category",
            label: "Validation",
            elements: [
                {
                    $ref:'validation.uischema'
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
} as Categorization | UISchemaElement;

