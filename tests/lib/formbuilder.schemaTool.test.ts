import {expect, test} from 'vitest'
import {setItemSchemaToSchema, ToolInterface} from '../../src'

test('optionDataPrepare - with empty', () => {
    const tool = {
        propertyName: 'control1',
        schema: {
            type: "array",
        }
    };
    const expected = {
        properties: {
            control1: {
                type: "array",
                items: {
                    type: 'object'
                }
            }
        }
    };

    const rootSchema = {};
    setItemSchemaToSchema(tool as ToolInterface, rootSchema, undefined)
    expect(rootSchema).toEqual(expected)
})


test('setItemSchemaToSchema - with $ref', () => {
    const tool = {
        propertyName: 'exampleArray',
        schema: {
            type: "array",
            items: {
                $ref: "#/definitions/choicesContainer"
            }
        }
    };
    const expected = {
        properties: {
            exampleArray: tool.schema
        }
    };

    const rootSchema = {};
    setItemSchemaToSchema(tool as ToolInterface, rootSchema, undefined)
    expect(rootSchema).toEqual(expected)
})

test('setItemSchemaToSchema - with object', () => {
    const tool = {
        propertyName: 'comments',
        schema: {
            type: "array",
            items: {
                type: 'object',
                properties: {
                    message: {
                        type: "string"
                    }
                }
            }
        }
    };
    const expected = {
        properties: {
            comments: tool.schema
        }
    };

    const rootSchema = {};
    setItemSchemaToSchema(tool as ToolInterface, rootSchema, undefined)
    expect(rootSchema).toEqual(expected)
})

test('setItemSchemaToSchema - with string items -> existing properties will be removed', () => {
    const tool = {
        propertyName: 'comments',
        schema: {
            type: "array",
            items: {
                type: 'string',
            }
        }
    };
    const expected = {
        type: "object",
        properties: {
            comments: tool.schema
        }
    };

    const rootSchema = {
        type: "object",
        properties: {
            comments: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        message: {
                            type: "string"
                        },
                    }
                }
            }
        }
    }
    setItemSchemaToSchema(tool as ToolInterface, rootSchema, undefined)
    expect(rootSchema).toEqual(expected)
})
