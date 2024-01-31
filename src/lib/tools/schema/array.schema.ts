import type {Categorization, JsonSchema, Layout} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";

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
        uiOptions: {
            $ref:'uiOptions.schema#/properties/uiOptions'
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
                    type: "object"
                    // anyOf: [
                    //     {$ref:'#/definitions/optionsDetailAsString'},
                    //     {$ref:'#/definitions/optionsDetailAsObject'},
                    // ]
                }
                // detail: {
                //     type: "string",
                //     enum: ['DEFAULT', 'GENERATED', 'REGISTERED']
                // },
            }
        },
        "_readOnlySchema": {
            "type": "object",
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
                                    $ref:'labelAndI18n.both.uischema'
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
        {
            type: "Category",
            label: "Detail",
            elements: [
                {
                    "scope": "#/properties/options/properties/detail",
                    "type": "Formbuilder",
                    "options": {
                        "schemaReadOnly": true,
                        "schemaScope": "#/properties/_readOnlySchema"
                    }
                },
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
            ],
            rule: {
                effect: "SHOW",
                condition: {
                    scope: "#/properties/_isUischema",
                    schema:{ const: true }
                }
            }
        },
    ]
} as Categorization | UISchemaElement;

