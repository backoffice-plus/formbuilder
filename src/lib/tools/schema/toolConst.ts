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
        const: {
            type:'string',
            // oneOf: [
            //     {type:'string',title:'string'},
            //     {type:'number',title:'number'},
            //     {type:'integer',title:'integer'},
            //     {type:'boolean',title:'boolean'},
            // ]
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
                            type:'Control',
                            scope: '#/properties/const',
                        },
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

