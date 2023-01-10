const schema = {
    "type": "object",
    "properties": {
        "propertyName": {
            "type": "string"
        },
        "label": {
            "type": "string"
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
                        scope: {
                            type: "string",
                            description: "like \"#/properties/name\""
                        },
                        schema: {
                            type: "string",
                            description: "like \"{\"enum\":[\"foo\"]}\" or \"{\"const\":true}\""
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
            },
        },
    },
    "required": [
        "propertyName"
    ]
}

const uischema = {

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
                            "scope": "#/properties/description",
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
                            "scope": "#/properties/rule/properties/condition/properties/scope",
                            "type": "Control"
                        },
                        {
                            "scope": "#/properties/rule/properties/condition/properties/schema",
                            "type": "Control"
                        },
                    ],
                }
            ]
        },
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
