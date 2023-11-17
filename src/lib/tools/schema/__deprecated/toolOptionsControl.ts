import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface} from "../../../models";

export const schema = {
    definitions: {
        selectAsEnum: {
            type: "array",
            items: {
                type: 'string',
            },
        },
        selectAsOneOf: {
            type: "array",
            items: {
                type: 'object',
                properties: {
                    const: {
                        type: "string"
                    },
                    title: {
                        type: "string"
                    },
                }
            },
        },
        rule: {
            $ref:'toolOptionsSchemaRule.schema#/definitions/rule'
        }
        //
        // rule: {
        //     type: 'object',
        //     properties: {
        //         effect: {type:'string',enum:['SHOW','HIDE','ENABLE','DISABLE']},
        //         condition: {
        //             title: "ConditionType",
        //             oneOf: [
        //                 {$ref: '#/definitions/ruleCondition',title:'SingleCondition'},
        //                 {$ref: '#/definitions/ruleConditions',title:'CombinedConditions'}
        //             ]
        //         }
        //     }
        // },
        // ruleCondition: {
        //     type: 'object',
        //     properties: {
        //         scope: {type:'string'},
        //         schema: {
        //             type: 'object',
        //             properties: {
        //                 //const: {type:['string','number','boolean']}
        //                 const: {
        //                     oneOf: [
        //                         {type:'string',title:'string'},
        //                         {type:'number',title:'number'},
        //                         {type:'boolean',title:'boolean'},
        //                     ]
        //                 }
        //             }
        //
        //             // oneOf: [
        //             //     {$ref:'#/definitions/ruleConditionSchemaConst',title:'Const'},
        //             //     // {$ref:'#/definitions/ruleConditionSchemaConstString',title:'String'},
        //             //     // {$ref:'#/definitions/ruleConditionSchemaConstNumber',title:'Number'},
        //             //     // {$ref:'#/definitions/ruleConditionSchemaConstBoolean',title:'Boolean'},
        //             // ]
        //         }
        //     }
        // },
        // ruleConditions: {
        //     type: 'object',
        //     properties: {
        //         type: {type:'string',enum:['AND','OR']},
        //         conditions: {
        //             type: 'array',
        //             minItems: 1,
        //             items: {
        //                // $ref: '#/definitions/ruleCondition'
        //
        //                 //$ref not working?!?!?!
        //                 type: 'object',
        //                 properties: {
        //                     scope: {type:'string'},
        //                     schema: {
        //                         type: 'object',
        //                         properties: {
        //                             const: {type:'string'}
        //                         }
        //                     }
        //                 }
        //             }
        //         }
        //     },
        // },
        // ruleConditionSchemaConst: {
        //     type: 'object',
        //     properties: { const: {type:['string','number','boolean']} }
        // },
        // // ruleConditionSchemaConstString: {
        // //     type: 'object',
        // //     properties: { const: {type:'string'} }
        // // },
        // // ruleConditionSchemaConstNumber: {
        // //     type: 'object',
        // //     properties: { const: {type:'number'} }
        // // },
        // // ruleConditionSchemaConstBoolean: {
        // //     type: 'object',
        // //     properties: { const: {type:'boolean'} }
        // // },

    },
    "type": "object",
    "properties": {
        validation: {
            $ref:'toolOptionsSchemaValidation.schema#/properties/validation'
        },
        rule: {
            $ref:'toolOptionsSchemaRule.schema#/properties/rule'
        },

        "propertyName": {
            "type": "string"
        },
        "label": {
            "type": "string",
            required: ["label"],
        },
        "inputType": {
            "type": "string",
        },
        "description": {
            "type": "string"
        },
        i18n: {
            type: "string",
            title: 'i18n',
            description: "alternative lookup key for translation catalogue",
        },

        default: {
            type: "string",
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


        select: {
            type: 'object',
            properties: {
                _type: {
                    type: "string",
                    enum: ['oneOf', 'enum'],
                },
                // enumOrOneOf: {
                //     oneOf: [
                //         {$ref:'#/definitions/selectAsEnum'},
                //         {$ref:'#/definitions/selectAsOneOf'},
                //     ]
                // },
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


        required: {
            "type": "boolean"
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
                showUnfocusedDescription: {
                    type: "boolean",
                },
                multi: {
                    type: "boolean",
                },
            },
        },
    },
    "required": [
        "propertyName"
    ]

}

export const uischema = {

    "type": "Categorization",
    "elements": [
        {
            "type": "Category",
            "label": "Base",
            "elements": [
                {
                    "type": "VerticalLayout",
                    "elements": [
                        {
                            "type": "HorizontalLayout",
                            "elements": [
                                {
                                    "scope": "#/properties/propertyName",
                                    "type": "Control"
                                },
                                {
                                    "scope": "#/properties/label",
                                    "type": "Control"
                                },
                            ]
                        },

                        {
                            "type": "Group",
                            "label": "Form Type",
                            "elements": [
                                {
                                    "type": "HorizontalLayout",
                                    "elements": [
                                        {
                                            "scope": "#/properties/type",
                                            "type": "Control"
                                        },
                                        {
                                            "scope": "#/properties/format",
                                            "type": "Control",
                                            "rule": {
                                                "effect": "ENABLE",
                                                "condition": {
                                                    "scope": "#/properties/type",
                                                    "schema": {
                                                        "const": "string"
                                                    }
                                                }
                                            }
                                        }
                                    ]
                                },
                                {
                                    "scope": "#/properties/options/properties/multi",
                                    "label": "as Textarea",
                                    "type": "Control",
                                    "rule": {
                                        "effect": "SHOW",
                                        "condition": {
                                            "type": "AND",
                                            "conditions": [
                                                {
                                                    "scope": "#/properties/type",
                                                    "schema": {
                                                        "const": "string"
                                                    }
                                                },
                                                {
                                                    "scope": "#/properties/format",
                                                    "schema": {
                                                        "not": {
                                                            "type": "string"
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
                            "scope": "#/properties/description",
                            "type": "Control"
                        },
                        {
                            "scope": "#/properties/options/properties/showUnfocusedDescription",
                            "type": "Control"
                        },
                        {
                            scope: "#/properties/i18n",
                            type: "Control"
                        },
                        // {
                        //     "type": "HorizontalLayout",
                        //     "elements": [
                        //         {
                        //             "scope": "#/properties/default",
                        //             "type": "Control"
                        //         },
                        //     ]
                        // },
                        {
                            "type": "HorizontalLayout",
                            "elements": [
                                {
                                    "scope": "#/properties/options/properties/placeholder",
                                    "type": "Control"
                                },
                            ]
                        },
                        {
                            "type": "HorizontalLayout",
                            "elements": [
                                {
                                    "scope": "#/properties/required",
                                    "type": "Control"
                                },
                                {
                                    "scope": "#/properties/options/properties/readonly",
                                    "type": "Control"
                                },
                            ]
                        },
                        {
                            "scope": "#/properties/inputType",
                            "type": "Control",
                            "rule": {
                                "effect": "HIDE",
                                "condition": {}
                            }
                        },
                    ],
                }
            ]
        },
        {
            "type": "Category",
            "label": "Validation",
            "elements": [
                {
                    $ref:'toolOptionsSchemaValidation.uischema'
                }
            ],
            "rule": {
                //"effect": "DISABLE",:TODO fix it CategorizationRenderer
                "effect": "HIDE",
                "condition": {
                    "scope": "#/properties/type",
                    "schema": { enum: ["boolean"] }
                }
            }
        },

        {
            "type": "Category",
            "label": "Rule",
            "elements": [
                {
                    $ref:'toolOptionsSchemaRule.uischema'
                },
            ]
        },

        /**
         * Tab - Items oneOf
         */
        {
            "type": "Category",
            "label": "Select Items",
            "elements": [
                {
                    type: "VerticalLayout",
                    elements: [
                        // {
                        //     "scope": "#/properties/select/properties/_type",
                        //     "type": "Control",
                        // },
                        {
                            type: "Control",
                            scope: "#/properties/select/properties/enum",
                            rule: {
                                "effect": "SHOW",
                                "condition": {
                                    "scope": "#/properties/select/properties/_type",
                                    "schema": { const: "enum" }
                                }
                            }
                        },
                        {
                            type: "Control",
                            scope: "#/properties/select/properties/oneOf",
                            rule: {
                                "effect": "SHOW",
                                "condition": {
                                    "scope": "#/properties/select/properties/_type",
                                    "schema": { const: "oneOf" }
                                }
                            }
                        },
                    ],
                }
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/select/properties/_type",
                    "schema": { enum: ["oneOf", "enum"] }
                }
            }
        },



        // /**
        //  * Tab - Enum
        //  */
        // {
        //     "type": "Category",
        //     //"label": "Enum",
        //     "label": "Items",
        //     "elements": [
        //         {
        //             type: "VerticalLayout",
        //             elements: [
        //                 {
        //                     "scope": "#/properties/enum",
        //                     "type": "Control",
        //                 },
        //             ],
        //         }
        //     ],
        //     "rule": {
        //         "effect": "SHOW",
        //         "condition": {
        //             "scope": "#/properties/_combinator",
        //             "schema": { const: "enum" }
        //         }
        //     }
        // },
        //
        // /**
        //  * Tab - oneOf
        //  */
        // {
        //     "type": "Category",
        //     //"label": "oneOf",
        //     "label": "Items",
        //     "elements": [
        //         {
        //             type: "VerticalLayout",
        //             elements: [
        //                 {
        //                     "scope": "#/properties/oneOf",
        //                     "type": "Control",
        //                     // "options": {
        //                     //     detail : {
        //                     //         "type": "HorizontalLayout",
        //                     //         "elements": [
        //                     //             {
        //                     //                 "type": "Control",
        //                     //                 "scope": "#/properties/const"
        //                     //             },
        //                     //             {
        //                     //                 "type": "Control",
        //                     //                 "scope": "#/properties/title"
        //                     //             }
        //                     //         ]
        //                     //     },
        //                     // },
        //                 },
        //             ],
        //         }
        //     ],
        //     "rule": {
        //         "effect": "SHOW",
        //         "condition": {
        //             "scope": "#/properties/_combinator",
        //             "schema": { const: "oneOf" }
        //         }
        //     }
        // },
    ]
}

export const jsonForms = {schema:schema as JsonSchema, uischema:uischema as UISchemaElement} as JsonFormsInterface;
