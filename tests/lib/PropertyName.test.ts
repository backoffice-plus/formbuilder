import {expect, test} from 'vitest'
import {PropertyName} from "../../src/lib/PropertyName";

test('PropertyName - with empty', () => {

    const pn = new PropertyName('person.name');

    console.log("pn",pn.composeWithUi())

    //expect(tool.optionDataPrepare(tool)).toEqual(expected)
})
