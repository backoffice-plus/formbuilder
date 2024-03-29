import _ from 'lodash';
import {expect, test} from 'vitest'
import {ArrayTool} from "../../src/lib/tools/ArrayTool";

test('optionDataPrepare - with empty', () => {

    const tool = new ArrayTool();
    tool.propertyName = 'control1';

    const expected = {
        propertyName: tool.propertyName,
        type: 'array',
        // items: {
        //     type: 'object'
        // }
    };

    const options = tool.optionDataPrepare({});
    const optionsPicked = _.pick(options, Object.keys(expected))
    expect(optionsPicked).toEqual(expected)
})

test('optionDataPrepare - with object', () => {

    const tool = new ArrayTool();
    tool.propertyName = 'control1';
    tool.schema = {
        type: "array",
        items: {
            type: 'object',
            properties: {
                message: {
                    type: "string"
                }
            }
        }
    };

    const expected = {
        propertyName: tool.propertyName,
        type: tool.schema.type,
        //items: tool.schema.items
    };

    const options = tool.optionDataPrepare({});
    const optionsPicked = _.pick(options, Object.keys(expected))
    expect(optionsPicked).toEqual(expected)
})
test('optionDataPrepare - with $ref', () => {

    const tool = new ArrayTool();
    tool.propertyName = 'control1';
    tool.schema = {
        type: "array",
        items: {
            $ref: "#/definitions/choicesContainer"
        }
    };

    const expected = {
        propertyName: tool.propertyName,
        type: tool.schema.type,
        // items: {
        //     _reference: tool.schema.items['$ref'],
        // }
    };

    const options = tool.optionDataPrepare({});
    const optionsPicked = _.pick(options, Object.keys(expected))
    expect(optionsPicked).toEqual(expected)
})


test('optionDataUpdate - with string items -> existing properties will be removed', () => {

    //old date
    const tool = new ArrayTool();
    tool.propertyName = 'strings';
    tool.schema = {
        type: "array",
        items: {
            type: 'object',
            properties: {
                message: {
                    type: "string"
                }
            }
        }
    };

    // const data = {
    //     propertyName: 'myStrings',
    //     type: 'array',
    //     items: {
    //         type: 'string',
    //
    //         //old data
    //         properties: tool.schema.items.properties
    //     }
    // };

    const expected = {
        type: "array",
        // items: {
        //     type: 'string',
        // }
    };

    const options = tool.optionDataPrepare({});
    const optionsPicked = _.pick(options, Object.keys(expected))
    expect(optionsPicked).toEqual(expected)
})


const a = {
    properties: {


        //array of objects
        users: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string"
                    },
                    age: {
                        type: "number"
                    },
                },
            },
        },

        //array of strings
        comments: {
            type: "array",
            items: {
                type: "string"
            }
        },

        //refs
        exampleArray: {
            type: "array",
            items: {
                $ref: "#/definitions/choicesContainer"
            }
        },

        //combinator
        addressOrUsers: {
            type: 'array',
            items: {
                oneOf: [
                    {$ref: '#/definitions/address'},
                    {$ref: '#/definitions/user'}
                ]
            }
        }
    }
};
