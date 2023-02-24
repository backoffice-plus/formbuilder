import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    definitions: {
        user: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                }
            }
        }
    },
    properties: {
        users: {
            type: 'array',
            items: {
                $ref: '#/definitions/user'
            }
        }
    }
};

export const uischema = {
    type: 'VerticalLayout',
    elements: [
        {
            type: 'Control',
            scope: '#/properties/users'
        }
    ]
};

export const data = {};

registerExamples([
    {
        name: 'fb.arrayofref',
        label: 'FormBuilder - Array of $ref',
        data,
        schema,
        uischema
    }
]);
