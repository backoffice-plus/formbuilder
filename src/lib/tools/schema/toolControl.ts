import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './labelAndI18n'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './validation'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: "object",
    "properties": {
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

        // schema: {
        //     type: "object",
        //     properties: {
                type: {
                    type: "string",
                    enum: ['string', 'number', 'integer', 'boolean'],
                },
                format: {
                    type: "string",
                    enum: ['date', 'time', 'date-time'],
                },
        //     },
        // },

        required: {
            type: "boolean"
        },

        options: {
            type: "object",
            properties: {
                readonly: {
                    type: "boolean",
                },
                placeholder: {
                    type: "string",
                },
                // showUnfocusedDescription: {
                //     type: "boolean",
                // },
                multi: {
                    type: "boolean",
                },
            },
        },
    },
    "required": [
        "propertyName"
    ]

} as JsonSchema;

export const uischema = {

    type: "Categorization",
    elements: [
        {
            type: "Category",
            label: "Base",
            elements: [
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/propertyName",
                                    type: "Control"
                                },
                            ]
                        },

                        {
                            type: "Group",
                            label: "Form Type",
                            elements: [
                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        {
                                            scope: "#/properties/type",
                                            type: "Control"
                                        },
                                        {
                                            scope: "#/properties/format",
                                            type: "Control",
                                            rule: {
                                                effect: "ENABLE",
                                                condition: {
                                                    scope: "#/properties/type",
                                                    schema: {
                                                        "const": "string"
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    scope: "#/properties/options/properties/multi",
                                    label: "as Textarea",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            type: "AND",
                                            conditions: [
                                                {
                                                    scope: "#/properties/type",
                                                    schema: {
                                                        const: "string"
                                                    }
                                                },
                                                {
                                                    scope: "#/properties/format",
                                                    schema: {
                                                        not: {
                                                            type: "string"
                                                        }
                                                    }
                                                }
                                            ]
                                        }
                                    }
                                }
                            ]
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


                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/options/properties/placeholder",
                                    type: "Control"
                                },
                            ]
                        },
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/required",
                                    type: "Control"
                                },
                                {
                                    scope: "#/properties/options/properties/readonly",
                                    type: "Control"
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

        /**
         * Tab - Items oneOf
         */
        {
            type: "Category",
            label: "Select Items",
            elements: [
                {
                    type: "VerticalLayout",
                    elements: [
                        // {
                        //     scope: "#/properties/select/properties/_type",
                        //     type: "Control",
                        // },
                        {
                            type: "Control",
                            scope: "#/properties/select/properties/enum",
                            rule: {
                                effect: "SHOW",
                                condition: {
                                    scope: "#/properties/select/properties/_type",
                                    schema: { const: "enum" }
                                }
                            }
                        },
                        {
                            type: "Control",
                            scope: "#/properties/select/properties/oneOf",
                            rule: {
                                effect: "SHOW",
                                condition: {
                                    scope: "#/properties/select/properties/_type",
                                    schema: { const: "oneOf" }
                                }
                            }
                        },
                    ],
                }
            ],
            rule: {
                effect: "SHOW",
                condition: {
                    scope: "#/properties/select/properties/_type",
                    schema: { enum: ["oneOf", "enum"] }
                }
            }
        },



        // /**
        //  * Tab - Enum
        //  */
        // {
        //     type: "Category",
        //     //label: "Enum",
        //     label: "Items",
        //     elements: [
        //         {
        //             type: "VerticalLayout",
        //             elements: [
        //                 {
        //                     scope: "#/properties/enum",
        //                     type: "Control",
        //                 },
        //             ],
        //         }
        //     ],
        //     rule: {
        //         effect: "SHOW",
        //         condition: {
        //             scope: "#/properties/_combinator",
        //             schema: { const: "enum" }
        //         }
        //     }
        // },
        //
        // /**
        //  * Tab - oneOf
        //  */
        // {
        //     type: "Category",
        //     //label: "oneOf",
        //     label: "Items",
        //     elements: [
        //         {
        //             type: "VerticalLayout",
        //             elements: [
        //                 {
        //                     scope: "#/properties/oneOf",
        //                     type: "Control",
        //                     // "options": {
        //                     //     detail : {
        //                     //         type: "HorizontalLayout",
        //                     //         elements: [
        //                     //             {
        //                     //                 type: "Control",
        //                     //                 scope: "#/properties/const"
        //                     //             },
        //                     //             {
        //                     //                 type: "Control",
        //                     //                 scope: "#/properties/title"
        //                     //             }
        //                     //         ]
        //                     //     },
        //                     // },
        //                 },
        //             ],
        //         }
        //     ],
        //     rule: {
        //         effect: "SHOW",
        //         condition: {
        //             scope: "#/properties/_combinator",
        //             schema: { const: "oneOf" }
        //         }
        //     }
        // },
    ]
} as Categorization|UISchemaElement;

