import {registerExamples} from "@jsonforms/examples/src/register";
import arrayControler from './json/renderer-arrayControler.form.json'
import arrayLayout from './json/renderer-arrayLayout.form.json'
import object from './json/renderer-object.form.json'
import enumArray from './json/renderer-enumArray.form.json'
import allOfAnyOfOneOf from './json/renderer-allOfAnyOfOneOf.form.json'
import categorization from './json/renderer-categorization.form.json'
import toggleSliderPasswordConst from './json/renderer-toggleSliderPasswordConst.form.json'
import radioGroup from './json/renderer-radioGroup.form.json'
import autocomplete from './json/renderer-autocomplete.form.json'

const examples = [
    {name:"Array Controler", schema:arrayControler, prefix:''},
    {name:"Array Layout", schema:arrayLayout, prefix:''},
    {name:"Enum Array", schema:enumArray, prefix:''},
    {name:"Object", schema:object, prefix:''},
    {name:"AllOf, AnyOf, OneOf", schema:allOfAnyOfOneOf, prefix:''},
    {name:"Categorization", schema:categorization, prefix:''},
    {name:"Toggle, Slider, Password, Const", schema:toggleSliderPasswordConst, prefix:''},
    {name:"RadioGroup", schema:radioGroup, prefix:''},
    {name:"Autocomplete", schema:autocomplete, prefix:''},
];

examples.forEach(item => {
    const {name,schema,prefix} = item;
    registerExamples([
        {
            name: 'fb.renderer.' + name,
            label: 'FormBuilder Renderer'+ (prefix?'.'+prefix:'') +' - '+ name,
            schema:schema.schema,
            uischema:schema.uischema,
            data:schema.data
        } as any
    ]);
})
