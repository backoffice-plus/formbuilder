import {registerExamples} from "@jsonforms/examples/src/register";

// import address from './json/schema/draft_202012/address.schema.json'
// import applicator from './json/schema/draft_202012/applicator.schema.json'
// import calender from './json/schema/draft_202012/calender.schema.json'
// import card from './json/schema/draft_202012/card.schema.json'
// import content from './json/schema/draft_202012/content.schema.json'
// import core from './json/schema/draft_202012/core.json.schema.json'
// import formatAnnotation from './json/schema/draft_202012/format-annotation.json.schema.json'
// import formatAssertion from './json/schema/draft_202012/format-assertion.json.schema.json'
// import geographical from './json/schema/draft_202012/geographical-location.schema.json'
// import metaData from './json/schema/draft_202012/meta-data.json.schema.json'
// import schema from './json/schema/draft_202012/schema.json.schema.json'
// import schema202012 from './json/schema/draft_202012/schema2020-12.schema.json'
// import unevaluated from './json/schema/draft_202012/unevaluated.json.schema.json'
// import validation from './json/schema/draft_202012/validation.schema.json'
import draft07 from './json/schema/draft_07/json-schema-draft-07-schema.json'
import github from './json/schema/draft_07/github.schema.json'
import gitlab from './json/schema/draft_07/gitlab.schema.json'
import changeset from './json/schema/draft_07/changeset.schema.json'
//import site from './json/schema/draft_07/site.schema.json'

const examples = [
    // {name:"address", schema:address, prefix:'example'},
    // {name:"applicator", schema:applicator, prefix:'meta'},
    // {name:"calender", schema:calender, prefix:'example'},
    // {name:"card", schema:card, prefix:'example'},
    // {name:"content", schema:content, prefix:'meta'},
    // {name:"core", schema:core, prefix:'meta'},
    // {name:"formatAnnotation", schema:formatAnnotation, prefix:'meta'},
    // {name:"formatAssertion", schema:formatAssertion, prefix:'meta'},
    // {name:"geographical", schema:geographical, prefix:'example'},
    // {name:"metaData", schema:metaData, prefix:'meta'},
    // {name:"schema", schema:schema, prefix:'example'},
    // {name:"schema202012", schema:schema202012, prefix:'meta'},
    // {name:"unevaluated", schema:unevaluated, prefix:'meta'},
    // {name:"validation", schema:validation, prefix:'meta'},
    {name:"draft07", schema:draft07, prefix:''},
    {name:"github", schema:github, prefix:''},
    {name:"gitlab", schema:gitlab, prefix:''},
    {name:"changeset", schema:changeset, prefix:''},
    //{name:"site", schema:site, prefix:''},//:TODO broken!
];

examples.forEach(item => {
    const {name,schema,prefix} = item;
    registerExamples([
        {
            name: 'fb.jsonschema.' + name,
            label: 'FormBuilder JsonSchema'+ (prefix?'.'+prefix:'') +' - '+ name,
            schema:schema,
            uischema:false,
            data:{}
        } as any
    ]);
})
