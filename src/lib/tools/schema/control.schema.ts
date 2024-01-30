import type {Categorization, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";

export const schema = {
    type: "object",

    definitions: {

        //@see http://json-schema.org/draft-07/schema#/definitions/simpleTypes
        type: {
            enum: ['string', 'number', 'integer', 'boolean'],
        },

        //@see https://json-schema.org/understanding-json-schema/reference/string.html?highlight=format#built-in-formats
        format: {
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
        "conditional": {
            "$ref": "conditional.schema#/properties/conditional"
        },
        rule: {
            $ref:'rule.schema#/properties/rule'
        },
        labelAndI18n: {
            $ref:'labelAndI18n.schema#/properties/labelAndI18n'
        },
        uiOptions: {
            $ref:'uiOptions.schema#/properties/uiOptions'
        },

        schema: {
            "type": "object",
            "properties": {
                "type": {  "$ref": "#/definitions/type" },
                "format": {  "$ref": "#/definitions/format" },

                "contentMediaType": {
                    "type": "string",
                    "description": 'like: "image/*", "image/jpeg" or "application/pdf"'
                },
                "contentEncoding": {
                    "type": "string",
                    //enum: ['7bit', '8bit', 'binary', 'quoted-printable', 'base16', 'base32', 'base64']
                    "enum": ['base64'] //there are really only two options useful for modern usage
                },
            },
        },


        propertyName: {
            type: "string",
            pattern: "^[a-z]"
        },

        required: {
            type: "boolean"
        },

        "-----options": {
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
            "additionalProperties": {
               // "type": "string"
                oneOf: [
                    {type:"string","title":"string"},
                    {type:"boolean","title":"boolean"},
                    {type:"number","title":"number"},
                    // {type:"array",items:{type:"string"},"title":"array of strings"},
                    // {type:"array",items:{type:"number"},"title":"array of number"},
                ],
            }
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
                                    type: "Control",
                                    // rule: {
                                    //     effect: "DISABLE",
                                    //     condition: {
                                    //         scope: "#",
                                    //         schema: {
                                    //             properties: {
                                    //                 _isUischema:{const:false},
                                    //                 _isSchemaOnly:{const:false},
                                    //             }
                                    //         }
                                    //     }
                                    // }
                                },
                            ],
                            "rule": {
                                "effect": "SHOW",
                                "condition": {
                                    "scope": "#/properties/_isProperty",
                                    "schema": {"const": true}
                                }
                            }
                        },

                        {
                            type: "Group",
                            label: "Form Type",
                            elements: [
                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        {
                                            scope: "#/properties/schema/properties/type",
                                            type: "Control"
                                        },
                                        {
                                            scope: "#/properties/schema/properties/format",
                                            type: "Control",
                                            rule: {
                                                effect: "ENABLE",
                                                condition: {
                                                    scope: "#/properties/schema/properties/type",
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
                                            "scope": "#/properties/schema/properties/contentMediaType",
                                            "type": "Control"
                                        },
                                        {
                                            "scope": "#/properties/schema/properties/contentEncoding",
                                            "type": "Control",
                                        }
                                    ],
                                    "rule": {
                                        "effect": "ENABLE",
                                        "condition": {
                                            "scope": "#/properties/schema/properties/type",
                                            "schema": {
                                                "const": "string"
                                            }
                                        }
                                    }
                                },


                                {
                                    type: 'VerticalLayout',
                                    elements: [
                                        {
                                            scope: "#/properties/uiOptions/properties/options/properties/multi",
                                            label: "as Textarea",
                                            type: "Control",
                                            rule: {
                                                effect: "SHOW",
                                                condition: {
                                                    type: "AND",
                                                    conditions: [
                                                        {
                                                            scope: "#/properties/schema/properties/type",
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
                                            scope: "#/properties/uiOptions/properties/options/properties/toggle",
                                            label: "as Toggle",
                                            type: "Control",
                                            options: {
                                                toggle: true,
                                            },
                                            rule: {
                                                effect: "SHOW",
                                                condition: {
                                                    scope: "#/properties/schema/properties/type",
                                                    schema: {
                                                        const: "boolean"
                                                    }
                                                }
                                            }
                                        },
                                    ],
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            type: "AND",
                                            conditions: [
                                                {
                                                    scope: "#/properties/_isUischema",
                                                    schema: {
                                                        const: true
                                                    }
                                                },
                                            ]
                                        }
                                    }
                                },


                            ]
                        },


                        {
                            type: "Group",
                            label: "Label & Description",
                            elements: [
                                {
                                    type:'VerticalLayout',
                                    elements: [{ $ref:'labelAndI18n.uischema'}],
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/_isUischema",
                                            schema: {const: true}
                                        },
                                    },
                                },

                                {
                                    type:'VerticalLayout',
                                    elements: [{ $ref:'labelAndI18n.descriptionOnly.uischema' }],
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/_isUischema",
                                            schema: {const: false}
                                        },
                                    },
                                },


                            ]
                        },
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/uiOptions/properties/options/properties/placeholder",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition:   {
                                            scope: "#/properties/_isUischema",
                                            schema: {const: true}
                                        },
                                    }
                                },
                            ]
                        },
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/required",
                                    type: "Control",
                                    "rule": {
                                        "effect": "SHOW",
                                        "condition": {
                                            "scope": "#/properties/_isProperty",
                                            "schema": {"const": true}
                                        }
                                    }
                                },
                                {
                                    scope: "#/properties/uiOptions/properties/options/properties/readonly",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition:   {
                                            scope: "#/properties/_isUischema",
                                            schema: {const: true}
                                        },
                                    }

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
                effect: "DISABLE",
                condition: {
                    scope: "#/properties/schema/properties/type",
                    schema: { enum: ["boolean"] }
                }
            }
        },


        {
            "type": "Category",
            "label": "Conditional",
            "elements": [
                {
                    "$ref": "conditional.uischema"
                }
            ]
        },

        /**
         * Tab - Styles
         */
        {
            type: "Category",
            "label": "Options & Styles",
            "elements": [
                {
                    "type": "LayoutRef",
                    "$ref":"uiOptions.uischema"
                },
            ],
            rule: {
                effect: "SHOW",
                condition: {
                    scope: "#/properties/_isUischema",
                    schema:{ const: true }
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
} as Categorization|UISchemaElement;

export const uischemaReadOnly = {

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
                            type: "Group",
                            label: "Label & Description",
                            elements: [
                                {
                                    $ref:'labelAndI18n.uischema'
                                },
                            ],
                        },
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/uiOptions/properties/options/properties/placeholder",
                                    type: "Control"
                                },
                            ]
                        },
                        {
                            type: "HorizontalLayout",
                            elements: [
                                {
                                    scope: "#/properties/uiOptions/properties/options/properties/readonly",
                                    type: "Control"
                                },
                            ]
                        },
                    ],
                }
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
