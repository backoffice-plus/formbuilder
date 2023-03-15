import type {Categorization, JsonSchema, Layout} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export const schema = {
    type: 'object',
    definitions: {
        optionsDetailAsString: {
            type: "string",
            title: 'options.detail as string',
            enum: ['DEFAULT', 'GENERATED', 'REGISTERED']
        },
        optionsDetailAsObject: {
            type: "object",
            title: 'options.detail as object',
            properties: {
                type: {
                    type: 'string',
                    enum: ['VerticalLayout', 'HorizontalLayout'],//:TODO add more
                },
                //:TODO just for dev - needs a real schema editor!
                elements: {
                    type: 'string',
                },
            }
        }
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


        propertyName: {
            type: "string"
        },
        // asInlineType: {
        //     type: "boolean",
        //     description: "for Array of Strings",
        // },
        options: {
            type: "object",
            properties: {
                elementLabelProp: {
                    type: "string"
                },
                detail: {
                    anyOf: [
                        {$ref:'#/definitions/optionsDetailAsString'},
                        {$ref:'#/definitions/optionsDetailAsObject'},
                    ]
                }
                // detail: {
                //     type: "string",
                //     enum: ['DEFAULT', 'GENERATED', 'REGISTERED']
                // },
            }
        },
        foo: {
            const: "foo"
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
                        // {
                        //     scope: "#/properties/asInlineType",
                        //     type: "Control",
                        //     options: {
                        //         showUnfocusedDescription: true
                        //     }
                        // },
                        {
                            scope: "#/properties/options/properties/elementLabelProp",
                            type: "Control",
                        },
                        {
                            type: "Group",
                            label: "Label & Description",
                            elements: [
                                {
                                    $ref:'labelAndI18n.noDescription.uischema'
                                },
                            ]
                        },
                    ],
                }
            ]
        },


        /**
         * Tab - options.detail
         */
        // {
        //     type: "Category",
        //     label: "Subschema",
        //     elements: [
        //
        //         {
        //             type: 'Label',
        //             text: ':TODO'
        //         },
        //
        //         {
        //             scope: "#/properties/options/properties/detail",
        //             type: "Control",
        //             // options: {
        //             //     detail: {
        //             //         type: 'Label',
        //             //         elements: []
        //             //     }
        //             // }
        //         },
        //
        //
        //         // /**
        //         //  * Detail as String
        //         //  */
        //         // {
        //         //     type: "GROUP",
        //         //     label: "details as string AGAIN",
        //         //     elements: [
        //         //         {
        //         //             scope: "#/properties/options/properties/detail",
        //         //             label: 'Detail as String',
        //         //             type: "Control"
        //         //         },
        //         //     ],
        //         //     rule: {
        //         //         effect: 'SHOW',
        //         //         condition: {
        //         //             scope: "#/properties/options/properties/detail",
        //         //             schema: { type: 'string' }
        //         //         }
        //         //     }
        //         // },
        //         //
        //         //
        //         // /**
        //         //  * Detail as Obj
        //         //  */
        //         // {
        //         //     type: "VerticalLayout",
        //         //     elements: [
        //         //         {
        //         //             scope: "#/properties/options/properties/detail/properties/type",
        //         //             type: "Control",
        //         //         },
        //         //         {
        //         //
        //         //             scope: "#/properties/options/properties/detail/properties/elements",
        //         //             type: "Control",
        //         //             options: {
        //         //                 "multi": true
        //         //             }
        //         //         }
        //         //     ],
        //         //     rule: {
        //         //         effect: 'ENABLE',
        //         //         condition: {
        //         //             scope: "#/properties/options/properties/detail",
        //         //             schema: { type: 'object' }
        //         //         }
        //         //     }
        //         // },
        //     ],
        // },


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

