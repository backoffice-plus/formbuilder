import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    properties: {
        rootColors: {
            anyOf:  [
                {type:'string'},
                {
                    oneOf: [
                        {const:'foo'},
                        {const:'bar'},
                    ]
                }
            ]
        },
    },
};

export const uischema = {
    type: 'Group',
    text: 'Group Root',
    elements: [
         {type:'Control', scope:'#/properties/rootColors'},
    ]
};

export const data = {};

registerExamples([
    {
        name: 'fb.nestedCombinator',
        label: 'FormBuilder - nested Combinator',
        data,
        schema,
        uischema
    }
]);
