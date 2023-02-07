import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    properties: {
        usercolors: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                    },
                    colors: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                name: { type: 'string',  },
                                code: { type: 'string',  },
                            }
                        }
                    }
                }
            }
        }
    }
};

export const uischema = {
    type: 'VerticalLayout',
    elements: [
        {
            type: 'Control',
            scope: '#/properties/arrayarray'
        }
    ]
};

export const data = {};

registerExamples([
    {
        name: 'arrayarray',
        label: 'FormBuilder - Array with Array',
        data,
        schema,
        uischema
    }
]);
