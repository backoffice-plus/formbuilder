import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    definitions: {
        colors: {
            type: 'string',
            enum: ['red', 'green', 'blue']
        },
    },
    properties: {
        rootColors: {$ref: '#/definitions/colors'},
        rootText: {type:'string'},
        colorsA: {
            type: 'object',
            properties: {
                AColors: {
                    allOf: [{$ref: '#/definitions/colors'}],
                    //$ref: '#/definitions/colors', //$ref is not working here - wrap it in allOf!!!
                },
                AText: {type:'string'},
                colorsB: {
                    type: 'object',
                    properties: {
                        BColors: {
                            allOf: [{$ref: '#/definitions/colors'}],
                            //$ref: '#/definitions/colors', //$ref is not working here - wrap it in allOf!!!
                        },
                        BText: {type:'string'},
                    },
                },
            },
        },
    },
};

export const uischema = {
    type: 'Group',
    text: 'Group Root',
    elements: [
        // {type:'Control', scope:'#'}, //formsbuilder does not supports this yet!
         {type:'Control', scope:'#/properties/colorsA'},
    ]
};

export const data = {};

registerExamples([
    {
        name: 'nestedRefs',
        label: 'FormBuilder - nested Refs',
        data,
        schema,
        uischema
    }
]);
