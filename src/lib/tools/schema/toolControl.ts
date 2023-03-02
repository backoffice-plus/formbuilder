import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";

export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './labelAndI18n'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './validation'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: "object",

    definitions: {

        //@see https://json-schema.org/understanding-json-schema/reference/string.html?highlight=format#built-in-formats
        formats: {
            type: "string",
            enum: [
                'date', 'time', 'date-time', 'duration',
                'email','password',
                'uuid',
                'regex',
                'hostname', 'ipv4', 'ipv6',
                'uri','uri-reference','iri','iri-reference',
                'binary',
            ],
        }
    },


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
            type: "string",
            pattern: "^[a-z]"
        },

        // schema: {
        //     type: "object",
        //     properties: {
                type: {
                    type: "string",
                    enum: ['string', 'number', 'integer', 'boolean'],
                },
                format:{$ref:'#/definitions/formats'},


                contentMediaType: {
                    type: "string",
                    description: 'like: "image/*", "image/jpeg" or "application/pdf"'
                },
                contentEncoding: {
                    type: "string",
                    //enum: ['7bit', '8bit', 'binary', 'quoted-printable', 'base16', 'base32', 'base64']
                    enum: ['base64'] //there are really only two options useful for modern usage
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
                toggle: {
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
                                    "type": "HorizontalLayout",
                                    "elements": [
                                        {
                                            "scope": "#/properties/contentMediaType",
                                            "type": "Control"
                                        },
                                        {
                                            "scope": "#/properties/contentEncoding",
                                            "type": "Control",
                                        }
                                    ],
                                    "rule": {
                                        "effect": "ENABLE",
                                        "condition": {
                                            "scope": "#/properties/type",
                                            "schema": {
                                                "const": "string"
                                            }
                                        }
                                    }
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
                                },
                                {
                                    scope: "#/properties/options/properties/toggle",
                                    label: "as Toggle",
                                    type: "Control",
                                    options: {
                                        toggle: true,
                                    },
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/type",
                                            schema: {
                                                const: "boolean"
                                            }
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
        // {
        //     type: "Category",
        //     label: "Select Items",
        //     elements: [
        //         {
        //             type: "VerticalLayout",
        //             elements: [
        //                 // {
        //                 //     scope: "#/properties/select/properties/_type",
        //                 //     type: "Control",
        //                 // },
        //                 {
        //                     type: "Control",
        //                     scope: "#/properties/select/properties/enum",
        //                     rule: {
        //                         effect: "SHOW",
        //                         condition: {
        //                             scope: "#/properties/select/properties/_type",
        //                             schema: { const: "enum" }
        //                         }
        //                     }
        //                 },
        //                 {
        //                     type: "Control",
        //                     scope: "#/properties/select/properties/oneOf",
        //                     rule: {
        //                         effect: "SHOW",
        //                         condition: {
        //                             scope: "#/properties/select/properties/_type",
        //                             schema: { const: "oneOf" }
        //                         }
        //                     }
        //                 },
        //             ],
        //         }
        //     ],
        //     rule: {
        //         effect: "SHOW",
        //         condition: {
        //             scope: "#/properties/select/properties/_type",
        //             schema: { enum: ["oneOf", "enum"] }
        //         }
        //     }
        // },



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

