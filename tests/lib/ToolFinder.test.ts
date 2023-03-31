import { expect, test } from 'vitest'
import {ToolFinder} from "../../src";


const toolFinder = new ToolFinder([]);

// const stringControlTool = findMatchingTool({}, {type: 'string'}, {type: 'Control', scope: '#'});
// const arrayControlTool = findMatchingTool({}, {type: 'array', items: {}}, {type: 'Control', scope: '#'});
// const objectControlTool = findMatchingTool({}, {type: 'object', properties: {}}, {type: 'Control', scope: '#'});
// const combinatorControlTool = findMatchingTool({}, {oneOf: []}, {type: 'Control', scope: '#'});
// const refControlTool = findMatchingTool({}, {'$ref': ''}, {type: 'Control', scope: '#'});


test('guessType', () => {

    const schemas = {
        minLength: {minLength: 1},
        minItems: {minItems: 1},
        uniqueItems: {uniqueItems: true},
    }

    expect(toolFinder.guessType(schemas.minLength)).toEqual('string')
    expect(toolFinder.guessType(schemas.minItems)).toEqual('array')
    expect(toolFinder.guessType(schemas.uniqueItems)).toEqual('array')
})
