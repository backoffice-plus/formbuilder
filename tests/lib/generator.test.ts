import {expect, test} from 'vitest'
import {cloneEmptyTool, findBaseTool,} from '../../src'
import {createJsonForms, generateSchemaByTool,} from '../../src'
import type {ToolInterface} from '../../src'
import {useTools} from "../../src/composable/tools";
import type {JsonSchema} from "@jsonforms/core";
import {defaultTools} from "../../src";

const {findMatchingTool, registerTools} = useTools();
registerTools(defaultTools);

const stringControlTool = findMatchingTool({}, {type: 'string'}, {type: 'Control', scope: '#'});
const arrayControlTool = findMatchingTool({}, {type: 'array', items: {}}, {type: 'Control', scope: '#'});
const objectControlTool = findMatchingTool({}, {type: 'object', properties: {}}, {type: 'Control', scope: '#'});
const combinatorControlTool = findMatchingTool({}, {oneOf: []}, {type: 'Control', scope: '#'});
const refControlTool = findMatchingTool({}, {'$ref':''}, {type: 'Control', scope: '#'});

const clone = (tool:ToolInterface, propName:string|undefined = undefined, schema:JsonSchema|undefined = undefined) => {
    const clone = cloneEmptyTool(tool, schema);

    //set default data
    if(propName) {
        const defaultData = clone.optionDataPrepare({})
        defaultData.propertyName = propName;
        clone.optionDataUpdate({}, defaultData);
    }

    return clone;
}

test('createJsonForms - string in layout', () => {

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(clone(stringControlTool,'myString'))

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myString: {
                    type: 'string',
                }
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    scope: "#/properties/myString",
                    type: "Control",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})

test('createJsonForms - multichoice enum in layout', () => {

    const selectEnumControlTool = findMatchingTool({}, {type:'string', enum: []}, {type: 'Control', scope: '#'});
    const selectOneOfControlTool = findMatchingTool({}, {type:'string', oneOf: []}, {type: 'Control', scope: '#'});

    const oneOf =  [
        {const: 'foo', title: 'Foo'},
        {const: 'bar', title: 'Bar'},
        {const: 'foobar', title: 'FooBar'}
    ];

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(clone(selectEnumControlTool,'myString', {type:'string',enum: ['foo', 'bar', 'foobar']}))
    baseTool.childs.push(clone(selectOneOfControlTool,'oneOfEnum', {type:'string',oneOf: oneOf}))

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myString: {
                    type: 'string',
                    enum: ['foo', 'bar', 'foobar']
                },
                oneOfEnum: {
                    type: 'string',
                    oneOf: oneOf
                },
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    type: "Control",
                    scope: "#/properties/myString",
                },
                {
                    type: "Control",
                    scope: "#/properties/oneOfEnum",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})

test('createJsonForms - array of object in layout', () => {
    const string = clone(stringControlTool, 'myString');
    const object = clone(objectControlTool);
    const array = clone(arrayControlTool, 'myArray')


    object.childs.push(string)
    array.childs.push(object)

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(array)

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myArray: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            myString: {
                                type: 'string',
                            }
                        }
                    }
                }
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    scope: "#/properties/myArray",
                    type: "Control",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})

test('createJsonForms - array of string in layout', () => {
    const array = clone(arrayControlTool, 'myArray')
    array.childs.push(clone(stringControlTool))

    //array.optionDataUpdate({}, {...array.optionDataPrepare({}), ...{asInlineType: true}})

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(array)

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myArray: {
                    type: 'array',
                    items: {
                        type: 'string',
                    }
                }
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    scope: "#/properties/myArray",
                    type: "Control",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})


test('createJsonForms - combinator with strings in layout', () => {
    const combinator = clone(combinatorControlTool, 'myComb')
    combinator.childs.push(clone(stringControlTool))
    combinator.childs.push(clone(stringControlTool))

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(combinator)

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myComb: {
                    anyOf: [
                        {type: 'string'},
                        {type: 'string'},
                    ]
                }
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    scope: "#/properties/myComb",
                    type: "Control",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})

test('createJsonForms - nested combinator in layout', () => {
    const combinator1 = clone(combinatorControlTool, 'myComb')
    const combinator2 = clone(combinatorControlTool, 'myComb2222')
    combinator1.childs.push(clone(stringControlTool))
    combinator1.childs.push(combinator2)
    combinator2.childs.push(clone(stringControlTool))

    const baseTool = findBaseTool({}, {type: 'Group', elements: []});
    baseTool.childs.push(combinator1)

    const jsonforms = createJsonForms(baseTool)
    const jsonformsCleaned = JSON.parse(JSON.stringify(jsonforms));//remove nested undefineds

    const expected = {
        schema: {
            type: 'object',
            properties: {
                myComb: {
                    anyOf: [
                        {type: 'string'},
                        {
                            anyOf: [
                                {type: 'string'},
                            ]
                        }
                    ]
                }
            }
        },
        uischema: {
            type: "Group",
            elements: [
                {
                    scope: "#/properties/myComb",
                    type: "Control",
                },
            ],
        }
    };

    expect(jsonformsCleaned.schema).toEqual(expected.schema)
    expect(jsonformsCleaned.uischema).toEqual(expected.uischema)
})

test('generateSchemaByTool - string in object', () => {
    const baseTool = clone(objectControlTool)
    baseTool.childs.push(clone(stringControlTool, 'name'));

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - strings in object', () => {
    const baseTool = clone(objectControlTool)
    baseTool.childs.push(clone(stringControlTool, 'name1'))
    baseTool.childs.push(clone(stringControlTool, 'name2'))

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            name1: {
                type: 'string',
            },
            name2: {
                type: 'string',
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})
test('generateSchemaByTool - multiple enum choice in object', () => {
    const baseTool = clone(objectControlTool)
    baseTool.childs.push(clone(stringControlTool, 'name', {type:'string',enum: ['foo', 'bar', 'foobar']}))

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            name: {
                type: 'string',
                enum: ['foo', 'bar', 'foobar']
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})


test('generateSchemaByTool - string required in object', () => {
    const baseTool = clone(objectControlTool)
    const string = clone(stringControlTool, 'name1')
    baseTool.childs.push(string)

    string.optionDataUpdate({}, {...string.optionDataPrepare({}), ...{required: true}})

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            name1: {
                type: 'string',
            },
        },
        required: [
            'name1'
        ]
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - multiple oneOf choice in object', () => {

    const oneOf = [
        {"const": "GD","title": "Grenada"},
        {"const": "EE","title": "Estland"},
    ];

    const baseTool = clone(objectControlTool)
    baseTool.childs.push(clone(stringControlTool, 'oneOfEnum', {type:'string', oneOf: oneOf}));

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            oneOfEnum: {
                type: 'string',
                oneOf: oneOf
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - object with string in object', () => {
    const baseTool = clone(objectControlTool)
    const objectTool = clone(objectControlTool, 'user')

    objectTool.childs.push(clone(stringControlTool,'username'))
    baseTool.childs.push(objectTool)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            user: {
                type: 'object',
                properties: {
                    username: {
                        type: 'string',
                    },
                },
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})
test('generateSchemaByTool - object nested', () => {
    const baseTool = clone(objectControlTool)
    const objectUserTool = clone(objectControlTool, 'user')
    const objectUserdataTool = clone(objectControlTool, 'data')

    objectUserdataTool.childs.push(clone(stringControlTool,'name'))
    objectUserdataTool.childs.push(clone(stringControlTool,'age', {type:'number'}))
    objectUserTool.childs.push(objectUserdataTool)
    baseTool.childs.push(objectUserTool)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            user: {
                type: 'object',
                properties: {
                    data: {
                        type: 'object',
                        properties: {
                            name: {type: 'string'},
                            age: {type: 'number'},
                        },
                    },
                },
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - array of objects in object', () => {
    const baseTool = clone(objectControlTool)
    const arrayTool = clone(arrayControlTool, 'users')
    const objectTool = clone(objectControlTool)
    const stringTool = clone(stringControlTool, 'name')

    stringTool.optionDataUpdate({}, {...stringTool.optionDataPrepare({}), ...{required: true}})

    objectTool.childs.push(stringTool)
    arrayTool.childs.push(objectTool)
    baseTool.childs.push(arrayTool)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {
                            type: 'string',
                        },
                    },
                    required: ['name']
                }
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - array of real objects in object', () => {
    const baseTool = clone(objectControlTool)
    const arrayTool = clone(arrayControlTool, 'users')
    const objectWrappedTool = clone(objectControlTool)
    const objectTool = clone(objectControlTool, 'user')

    objectTool.childs.push(clone(stringControlTool, 'name'))
    objectTool.childs.push(clone(stringControlTool, 'age', {type:'number'}))
    objectWrappedTool.childs.push(objectTool)
    arrayTool.childs.push(objectWrappedTool)
    baseTool.childs.push(arrayTool)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        user: {
                            type: 'object',
                            properties: {
                                name: { type: 'string'},
                                age: { type: 'number'},
                            },
                        }
                    },
                }
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})


test('generateSchemaByTool - array of objects with array of strings', () => {
    const baseTool = clone(objectControlTool)
    const arrayTool = clone(arrayControlTool, 'textsWithKeys')
    const objectTool = clone(objectControlTool)

    const stringKeyTool = clone(stringControlTool, 'key');
    objectTool.childs.push(stringKeyTool)

    const stringTextTool = clone(stringControlTool);
    const arrayTextsTool = clone(arrayControlTool, 'texts')
    arrayTextsTool.childs.push(stringTextTool)
    objectTool.childs.push(arrayTextsTool)

    arrayTool.childs.push(objectTool)
    baseTool.childs.push(arrayTool)

    stringTextTool.optionDataUpdate({}, {...stringTextTool.optionDataPrepare({}), ...{isInlineType: true}})
    
    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: "object",
        properties: {
            textsWithKeys: {
                type: "array",
                    items: {
                    type: "object",
                        properties: {
                        key: {
                            type: "string"
                        },
                        texts: {
                            type: "array",
                                items: {
                                type: "string"
                            }
                        }
                    }
                }
            }
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - array of strings in object', () => {
    const baseTool = clone(objectControlTool)
    const arrayTool = clone(arrayControlTool, 'colors')

    //arrayTool.optionDataUpdate({}, {...arrayTool.optionDataPrepare({}), ...{asInlineType: true}})

    arrayTool.childs.push(clone(stringControlTool))
    baseTool.childs.push(arrayTool)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            colors: {
                type: 'array',
                items: {
                    type: 'string',
                }
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - array nested in object', () => {
    const baseTool = clone(objectControlTool)
    const arrayUsersTool = clone(arrayControlTool, 'users')
    const arrayColorsTool = clone(arrayControlTool, 'colors')
    const textNameTool = clone(stringControlTool, 'name');
    const textColorTool = clone(stringControlTool, 'color');
    const objectTool = clone(objectControlTool)

    arrayColorsTool.childs.push(textColorTool)

    objectTool.childs.push(textNameTool)
    objectTool.childs.push(arrayColorsTool)

    arrayUsersTool.childs.push(objectTool)
    baseTool.childs.push(arrayUsersTool)

    //arrayColorsTool.optionDataUpdate({}, {...arrayColorsTool.optionDataPrepare({}), ...{asInlineType: true}})

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: {type: 'string'},
                        colors: {
                            type: 'array',
                            items: {
                                type:'string'
                            }
                        }
                    },
                }
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - combinators', () => {
    const baseTool = clone(objectControlTool)
    const combinator = clone(combinatorControlTool,'myComb')

    combinator.childs.push(clone(stringControlTool))
    combinator.childs.push(clone(stringControlTool))
    baseTool.childs.push(combinator)

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            myComb: {
                anyOf: [
                    {type: 'string'},
                    {type: 'string'},
                ]
            }
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - combinators nested', () => {
    const baseTool = clone(objectControlTool)

    const combinator1 = clone(combinatorControlTool, 'myComb')
    const combinator2 = clone(combinatorControlTool)
    combinator1.childs.push(clone(stringControlTool, undefined, {type:'number'}))
    combinator1.childs.push(combinator2)
    combinator2.childs.push(clone(stringControlTool, undefined, {type:'boolean'}))

    baseTool.childs.push(combinator1);

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            myComb: {
                anyOf: [
                    {type: 'number'},
                    {
                        anyOf: [
                            {type: 'boolean'},
                        ]
                    },
                ]
            }
        }
    };

    expect(schemaCleaned).toEqual(expected)
})
test('generateSchemaByTool - combinators object with required', () => {
    const selectEnumControlTool = findMatchingTool({}, {type:'string', enum: []}, {type: 'Control', scope: '#'});

    const baseTool = clone(objectControlTool)
    const combinator = clone(combinatorControlTool, 'myComb')
    const object = clone(objectControlTool)
    //const string = clone(stringControlTool, 'myString');
    const myEnum = clone(selectEnumControlTool, 'myEnum', {type:'string',enum: ['foo']});

    //object.childs.push(string);
    object.childs.push(myEnum);
    combinator.childs.push(object);
    baseTool.childs.push(combinator);

    //string.optionDataUpdate(string, {...string.optionDataPrepare(string), ...{required: true}})
    myEnum.optionDataUpdate({}, {...myEnum.optionDataPrepare({}), ...{required: true}})

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            myComb: {
                anyOf: [
                    {
                        type: 'object',
                        properties: {
                            myEnum: {
                                type: 'string',
                                enum: ['foo']
                            }
                        },
                        required: ['myEnum']
                    },
                ]
            }
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

test('generateSchemaByTool - ref in array in object', () => {
    const baseTool = clone(objectControlTool)
    const arrayTool = clone(arrayControlTool, 'users')
    const refTool = clone(refControlTool)

    arrayTool.childs.push(refTool);
    baseTool.childs.push(arrayTool);

    refTool.optionDataUpdate({}, {...refTool.optionDataPrepare({}), ...{_reference: '#/definitions/...'}})
    //arrayTool.optionDataUpdate({}, {...arrayTool.optionDataPrepare({}), ...{asInlineType: true}})

    const schema = generateSchemaByTool(baseTool)
    const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds

    const expected = {
        type: 'object',
        properties: {
            users: {
                type: 'array',
                items: {
                    '$ref': '#/definitions/...',
                }
            },
        }
    };

    expect(schemaCleaned).toEqual(expected)
})

// test('generateSchemaByTool - huge', () => {
//     const baseTool = clone(objectControlTool)
//
//     //root: comb -> array -> obj -> string
//     const c1 = clone(combinatorControlTool, 'c1')
//     baseTool.childs.push(c1);
//
//         const c1a1 = clone(arrayControlTool, 'c1a1')
//         c1.childs.push(c1a1);
//
//             const c1a1o1 = clone(objectControlTool, 'c1a1o1')
//             c1a1.childs.push(c1a1o1);
//             c1a1o1.childs.push(clone(stringControlTool,'s1'));
//
//
//     //root: obj -> array -> comb -> string
//     const o2 = clone(objectControlTool, 'o2')
//     baseTool.childs.push(o2);
//
//         const o2a1 = clone(arrayControlTool, 'o2a1')
//         o2.childs.push(o2a1);
//
//             const o2a1c1 = clone(combinatorControlTool, 'o2a1c1')
//             o2a1.childs.push(o2a1c1);
//             o2a1c1.childs.push(clone(stringControlTool,'s2'));
//
//
//
//     //root: array -> comb -> array ->-> string
//     const a3 = clone(arrayControlTool, 'a3')
//     baseTool.childs.push(a3);
//
//         const a3c1 = clone(combinatorControlTool, 'a3c1')
//         a3.childs.push(o2a1c1);
//
//             const a3c1o1 = clone(objectControlTool, 'a3c1o1')
//             a3c1.childs.push(o2a1);
//             a3c1o1.childs.push(clone(stringControlTool,'s3'));
//
//
//     const schema = generateSchemaByTool(baseTool)
//     const schemaCleaned = JSON.parse(JSON.stringify(schema));//remove nested undefineds
//
//     const expected = {
//         type: 'object',
//         properties: {
//             c1: {
//                 anyOf: [
//                     {
//                         type: "array",
//                         items: {
//                             type: "object",
//                             properties: {
//                                 c1a1o1: {
//                                     type: "object",
//                                     properties:  {
//                                         s1:  {
//                                             type: "string",
//                                         },
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 ],
//             },
//             o2:  {
//                 type: "object",
//                 properties:  {
//                     o2a1:  {
//                         type: "array",
//                         items:  {
//                             type: "object",
//                             properties:  {
//                                 o2a1c1:  {
//                                     anyOf:  [
//                                          {type: "string"},
//                                     ],
//                                 },
//                             },
//                         },
//                     },
//                 },
//             },
//             a3:  {
//                 type: "array",
//                 items:  {
//                     type: "object",
//                     properties:  {
//                         o2a1c1:  {
//                             anyOf:  [
//                                  {type: "string"},
//                             ],
//                         },
//                     },
//                 },
//             }
//         }
//     };
//
//     expect(schemaCleaned).toEqual(expected)
// })
