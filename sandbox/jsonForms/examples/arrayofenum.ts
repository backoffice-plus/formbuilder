import {registerExamples} from "@jsonforms/examples/src/register";

export const schema = {
    type: 'object',
    properties: {
        myItem: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    plainEnum: {
                        type: 'string',
                        enum: ['foo', 'bar']
                    },
                    oneOfEnum: {
                        type: 'string',
                        oneOf: [
                            {const: 'foo', title: 'Foo'},
                            {const: 'bar', title: 'Bar'},
                            {const: 'foobar', title: 'FooBar'}
                        ]
                    },
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
            scope: '#/properties/myItem'
        }
    ]
};

export const data = {};

registerExamples([
    {
        name: 'arrayofenum',
        label: 'FormBuilder - Array containing enums',
        data,
        schema,
        uischema
    }
]);
