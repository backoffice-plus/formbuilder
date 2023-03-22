import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: "object",
    definitions: {
        selectAsEnum: {
            properties: {
                enum: {
                    type: "array",
                    items: {
                        type: 'string',
                    },
                    title:"Items as string",
                },
            },
            required: ['enum'],
            title:"Items as string",
        },
        selectAsOneOf: {
            properties: {
                oneOf: {
                    type: "array",
                    items: {
                        type: 'object',
                        properties: {
                            const: {
                                type: "string",
                                title:"Key",
                            },
                            title: {
                                type: "string",
                                title:"Value",
                            },
                        }
                    },
                    title:"Items as Key-Value Pairs",
                },
            },
            required: ['oneOf'],
            title:"Items as Key-Value Pairs",
        },
    },
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
        styles: {
            $ref:'styles.schema#/properties/styles'
        },

        propertyName: {
            type: "string"
        },

        // type: {
        //     type: "string",
        //     enum: ['string', 'number', 'integer', 'boolean'],
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
                format: {
                    type: "string",
                    enum: ['radio']
                },
            },
        },


        select: {
            type: 'object',
            properties: {
                // enumOrOneOf: {
                //     oneOf: [
                //         {$ref:'#/definitions/selectAsEnum'},
                //         {$ref:'#/definitions/selectAsOneOf'},
                //     ]
                // },
                _type: {
                    type: "string",
                    enum: ['oneOf', 'enum'],
                },
                enum: {
                    type:'array',
                    $ref:'#/definitions/selectAsEnum'
                },
                oneOf: {
                    type: "array",
                    $ref:'#/definitions/selectAsOneOf'
                },
            },
        },

        enumOrOneOf: {
            oneOf: [
                {$ref:'#/definitions/selectAsEnum'},
                {$ref:'#/definitions/selectAsOneOf'},
            ]
        },

        asMultiSelect: {
            type: 'boolean',
        }
    },
    required: [
        "propertyName"
    ],

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
                            label: "Options",
                            elements: [
                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        // {
                                        //     scope: "#/properties/type",
                                        //     type: "Control"
                                        // },
                                        {
                                            scope: "#/properties/options/properties/format",
                                            type: "Control",
                                            // rule: {
                                            //     effect: "ENABLE",
                                            //     condition: {
                                            //         scope: "#/properties/type",
                                            //         schema: {
                                            //             "const": "string"
                                            //         }
                                            //     }
                                            // }
                                        }
                                    ]
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
                        {
                            scope: "#/properties/asMultiSelect",
                            type: "Control",
                        },
                        {
                            scope: "#/properties/enumOrOneOf",
                            type: "Control",
                            label: "Type of Items"
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
                        },
                    ],
                }
            ],
        },
    ]
} as Categorization|UISchemaElement;

