export const schema = {
    "type": "object",
    "properties": {
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

        rule: {
            type: "object",
            properties: {
                effect: {
                    type: "string",
                    enum: ['HIDE','SHOW','DISABLE','ENABLE']
                },
                condition: {
                    type: "object",
                    properties: {
                        // scope: {
                        //     type: "string",
                        //     description: "like \"#/properties/name\""
                        // },
                        //"schema": { const: true }
                        //"schema": { const: 1 }
                        //"schema": { const: "sometext" }
                        //"schema": { enum: ["radio"] }

                        _scopePropertyName: {
                            type: "string",
                        },
                        _schema: {
                            type: "string",
                            enum: ['const', 'enum']
                        },
                        _schemaConstType: {
                            type: "string",
                            enum: ['string', 'number', 'boolean'],
                        },
                        _schemaConstAsString: {type:'string'},
                        _schemaConstAsNumber: {type:'number'},
                        _schemaConstAsBoolean: {type:'boolean'},
                        schema: {
                            type: "object",
                            properties: {
                                //_constAsNumber: {type:'number'},
                                // const: {
                                //     type: ['number', 'string', 'boolean'],
                                // },
                                // enum: {
                                //     type: "array",
                                // },
                            },
                        },
                    }
                },
            }
        },
        "enum": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "label": "Name",
                    },
                }
            },
        },
        "oneOf": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "const": {
                        "type": "string"
                    },
                    "title": {
                        "type": "string"
                    },
                }
            },
        },


        maximum: {
            type: "number"
        },
        minimum: {
            type: "number"
        },
        minLength: {
            "type": "number"
        },
        maxLength: {
            "type": "number"
        },
        "pattern": {
            "type": "string",
            description: "for examples: \"[abc]+\""
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
                                    "type": "Control",
                                    //:TODO fix required
                                    "options": {
                                        "readonly": true
                                    },
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
                    "type": "VerticalLayout",
                    "elements": [
                        {
                            "type": "HorizontalLayout",
                            "elements": [
                                {
                                    "scope": "#/properties/minimum",
                                    "type": "Control"
                                },
                                {
                                    "scope": "#/properties/maximum",
                                    "type": "Control"
                                },
                            ],
                            "rule": {
                                "effect": "SHOW",
                                "condition": {
                                    "scope": "#/properties/inputType",
                                    "schema": { enum: ["number"] }
                                }
                            }
                        },
                        {
                            "type": "HorizontalLayout",
                            "elements": [
                                {
                                    "scope": "#/properties/minLength",
                                    "type": "Control"
                                },
                                {
                                    "scope": "#/properties/maxLength",
                                    "type": "Control"
                                },
                            ],
                            "rule": {
                                "effect": "SHOW",
                                "condition": {
                                    "scope": "#/properties/inputType",
                                    "schema": { enum: ["text"] }
                                }
                            }
                        },
                        {
                            "scope": "#/properties/pattern",
                            "type": "Control"
                        },
                    ],
                }
            ]
        },


        /**
         * Tab - Rule
         */
        {
            "type": "Category",
            "label": "Rule",
            "elements": [
                {
                    "type": "VerticalLayout",
                    "elements": [
                        {
                            "scope": "#/properties/rule/properties/effect",
                            "type": "Control"
                        },
                        {
                            "scope": "#/properties/rule/properties/condition/properties/_scopePropertyName",
                            "type": "Control",
                            label: 'Property Name',
                        },
                        {
                            type: "Group",
                            label: "Schema based condition",
                            elements: [

                                {
                                    type: "HorizontalLayout",
                                    elements: [
                                        {
                                            type: "Control",
                                            label: "Schema Type",
                                            scope: "#/properties/rule/properties/condition/properties/_schema"
                                        },
                                        {
                                            type: "Control",
                                            label: "Const Type",
                                            scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
                                            rule: {
                                                effect: "ENABLE",
                                                condition: {
                                                    scope: "#/properties/rule/properties/condition/properties/_schema",
                                                    schema: { const: "const" }
                                                }
                                            }
                                        },
                                    ],
                                },
                                {
                                    scope: "#/properties/rule/properties/condition/properties/_schemaConstAsString",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
                                            //schema: { enum: ["string"] }
                                            schema: { const: "string" }
                                        }
                                    }
                                },
                                {
                                    scope: "#/properties/rule/properties/condition/properties/_schemaConstAsNumber",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
                                            //schema: { enum: ["string"] }
                                            schema: { const: "number" }
                                        }
                                    }
                                },
                                {
                                    scope: "#/properties/rule/properties/condition/properties/_schemaConstAsBoolean",
                                    type: "Control",
                                    rule: {
                                        effect: "SHOW",
                                        condition: {
                                            scope: "#/properties/rule/properties/condition/properties/_schemaConstType",
                                            schema: { const: "boolean" }
                                        }
                                    }
                                },

                            ]
                        },
                    ],
                }
            ]
        },

        /**
         * Tab - Enum
         */
        {
            "type": "Category",
            "label": "Enum",
            "elements": [
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            "scope": "#/properties/enum",
                            "type": "Control",
                        },
                    ],
                }
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/inputType",
                    "schema": { enum: ["radio"] }
                }
            }
        },

        /**
         * Tab - oneOf
         */
        {
            "type": "Category",
            "label": "oneOf",
            "elements": [
                {
                    type: "VerticalLayout",
                    elements: [
                        {
                            "scope": "#/properties/oneOf",
                            "type": "Control",
                            "options": {
                                detail : {
                                    "type": "HorizontalLayout",
                                    "elements": [
                                        {
                                            "type": "Control",
                                            "scope": "#/properties/const"
                                        },
                                        {
                                            "type": "Control",
                                            "scope": "#/properties/title"
                                        }
                                    ]
                                },
                            },
                        },
                    ],
                }
            ],
            "rule": {
                "effect": "SHOW",
                "condition": {
                    "scope": "#/properties/inputType",
                    "schema": { enum: ["select"] }
                }
            }
        },
    ]
}

export const jsonForms = {schema:schema, uischema:uischema};