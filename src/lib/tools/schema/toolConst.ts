import type {Categorization, Category, JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './labelAndI18n'
export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './rule'

export const schema = {
    type: 'object',
    properties: {
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
        // type: {
        //     type: "string",
        //     enum: ['string', 'number', 'integer', 'boolean'],
        // },
        // const: {
        //     //type:'string',
        //     type:['string', 'number', 'integer', 'boolean'],
        // },
        // constNumber: {
        //     type:'number',
        // },
        // constBoolean: {
        //     type:'boolean',
        // },
        const: {
            oneOf: [
                {type:'string',title:'string'},
                {type:'number',title:'number'},
                //{type:'integer',title:'integer'},
                {type:'boolean',title:'boolean'},
                //{type:'null',title:'null'},
                //{not:{type:['string','number','integer','boolean']},title:'not'},
                //{type:'string',not:{type:['string','number','integer','boolean']},title:'not'},
                //{type:'array',title:'array'},
            ]
        },
        _parse: {
            type: "string",
            enum: ['json', 'null'],
        },
    },

    required: ['propertyName', 'const']
} as JsonSchema;

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
                            type:'Control',
                            scope: '#/properties/propertyName',
                        },
                        // {
                        //     scope: "#/properties/type",
                        //     type: "Control"
                        // },
                        {
                            type:'Group',
                            label: 'Const',
                            scope: '#/properties/const',
                            elements: [
                                // {
                                //     type:'Control',
                                //     label: 'Const Type',
                                //     scope: '#/properties/type',
                                // },
                                // {
                                //     type:'Control',
                                //     label: 'Const Type',
                                //     scope: '#/properties/const',
                                // },
                                {
                                    type:'Control',
                                    scope: '#/properties/const',
                                 },
                                {
                                    type:'Control',
                                    scope: '#/properties/_parse',
                                    rule: {
                                        effect: 'SHOW',
                                        condition: {
                                            scope: '#/properties/const',
                                            schema: {
                                                allOf: [
                                                    {type:'string'},
                                                    {
                                                        oneOf: [
                                                            {const: 'null'},
                                                            {pattern: '^\\{|\\[.*\\}|\\]$'},
                                                        ]
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                },
                                // {
                                //     type:'Control',
                                //     scope: '#/properties/constNumber',
                                // },
                                // {
                                //     type:'Control',
                                //     scope: '#/properties/constBoolean',
                                // },
                            ]
                        },
                        // {
                        //     type:'Control',
                        //     scope: '#/properties/_const',
                        // },
                        {
                            $ref:'labelAndI18n.uischema'
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
                    $ref:'rule.uischema'
                },
            ]
        },
    ]
} as Categorization|UISchemaElement;

