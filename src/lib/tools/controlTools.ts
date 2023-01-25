import {Tool, ToolProps} from "../models";
import {and, isBooleanControl, isNumberControl, isOneOfControl, isStringControl, or, rankWith} from "@jsonforms/core";
import {isIntegerControl, uiTypeIs} from "@jsonforms/core/src/testers/testers";

import formInputByType from "../../components/tools/formInputByType.vue";
import referenceComp from "../../components/tools/reference.vue";
import combinatorAsTabs from "../../components/tools/combinatorAsTabs.vue";

const control = new Tool('formInputByType', ToolProps.create({
    toolType: 'control',
    toolName: 'Control',
    jsonForms: {schema: {type: 'string'}, uischema: {type: 'Control'}}
}), rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl)));
control.importer = () => formInputByType;

const select = new Tool('formInputByType', ToolProps.create({
    toolName: 'select',
    jsonForms: {schema: {type: 'string', oneOf: []}, uischema: {type: 'Control'}}
}), rankWith(1, and(isStringControl, isOneOfControl)));
select.importer = () => formInputByType;


const reference = new Tool('reference', ToolProps.create({
    toolType: 'reference',
    jsonForms: {schema: {}, uischema: {type: 'Control'}}
}), rankWith(1,
    and(
        uiTypeIs('Control'),
        (uischema, schema) => undefined !== schema?.$ref
    )
));
reference.importer = () => referenceComp;

const combinator = new Tool('combinatorAsTabs', ToolProps.create({
    toolType: 'combinator',
    jsonForms: {schema: {}, uischema: {type: 'Control'}}
}), rankWith(2,
    and(
        uiTypeIs('Control'),
        (uischema, schema) => {
            const hasKeyword = undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf;
            const noType = undefined === schema?.type
            return hasKeyword && noType
        }
    )
));
combinator.importer = () => combinatorAsTabs;

// new Tool('formInputByType', ToolProps.create({
//     toolName: 'textarea',
//     jsonForms: {schema:{type:'string'}, uischema:{type:'Control', options:{multi:true}}}
// })),

// new Tool('formInputByType', ToolProps.create({
//     toolName: 'number',
//     jsonForms: {schema:{type:'number'}, uischema:{type:'Control'}}
// })),

// new Tool('formInputByType', ToolProps.create({
//     toolName: 'date',
//     jsonForms: {schema:{type:'string', format: 'date'}, uischema:{type:'Control'}}
// })),

//via optionModal.format
// new Tool('formInputByType', ToolProps.create({
//     toolName: 'datetime-local',
//     jsonForms: {schema:{type:'string', format: 'date-time'}, uischema:{type:'Control'}}
// })),
// new Tool('formInputByType', ToolProps.create({
//     toolName: 'time',
//     jsonForms: {schema:{type:'string', format: 'time'}, uischema:{type:'Control'}}
// })),

//no jsonforms renderer
// new Tool('formInputByType', ToolProps.create({
//     inputType: 'radio',
//     jsonForms: {schema:{type:'string',enum:[]}, uischema:{type:'Control', options:{format:'radio'}}}
// })),

// new Tool('formInputByType', ToolProps.create({
//     toolName: 'checkbox',
//     jsonForms: {schema:{type:'boolean'}, uischema:{type:'Control'}}
// })),

// new Tool('formInputByType', ToolProps.create({
//     inputType: 'file',
//     jsonForms: {schema:{type:'string', format:'file'}, uischema:{type:'Control'}}
// })),


//try to solve with optionmodal
// new Tool('formInputByType', ToolProps.create({
//     inputType: 'number',
//     jsonForms: {schema:{type:'integer'}, uischema:{type:'Control'}}
// })),

//no renderer for slider:true
// new Tool('formInputByType', ToolProps.create({
//   inputType: 'range',
//   jsonForms: {schema:{type:'number'}, uischema:{type:'Control',options:{"slider": true }}}
//   //{type: 'number',"minimum": 1,"maximum": 5, "default": 2}
// })),


export const controlTools = [
    control,
    select,
    reference,
    combinator
]
