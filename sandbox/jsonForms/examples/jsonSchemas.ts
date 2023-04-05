import {registerExamples} from "@jsonforms/examples/src/register";

import address from './json/address.schema.json'
import applicator from './json/applicator.schema.json'
import calender from './json/calender.schema.json'
import card from './json/card.schema.json'
import content from './json/content.schema.json'
import core from './json/core.json.schema.json'
import formatAnnotation from './json/format-annotation.json.schema.json'
import formatAssertion from './json/format-assertion.json.schema.json'
import geographical from './json/geographical-location.schema.json'
import metaData from './json/meta-data.json.schema.json'
import schema from './json/schema.json.schema.json'
import schema202012 from './json/schema2020-12.schema.json'
import unevaluated from './json/unevaluated.json.schema.json'
import validation from './json/validation.schema.json'

const examples = [
    {name:"address", schema:address, prefix:'example'},
    {name:"applicator", schema:applicator, prefix:'meta'},
    {name:"calender", schema:calender, prefix:'example'},
    {name:"card", schema:card, prefix:'example'},
    {name:"content", schema:content, prefix:'meta'},
    {name:"core", schema:core, prefix:'meta'},
    {name:"formatAnnotation", schema:formatAnnotation, prefix:'meta'},
    {name:"formatAssertion", schema:formatAssertion, prefix:'meta'},
    {name:"geographical", schema:geographical, prefix:'example'},
    {name:"metaData", schema:metaData, prefix:'meta'},
    {name:"schema", schema:schema, prefix:'example'},
    {name:"schema202012", schema:schema202012, prefix:'meta'},
    {name:"unevaluated", schema:unevaluated, prefix:'meta'},
    {name:"validation", schema:validation, prefix:'meta'},
];

examples.forEach(item => {
    const {name,schema,prefix} = item;
    registerExamples([
        {
            name: 'jsonschema.' + name,
            label: 'JsonSchema.'+ prefix +' - '+ name,
            schema:schema,
            uischema:false,
            data:{}
        } as any
    ]);
})
