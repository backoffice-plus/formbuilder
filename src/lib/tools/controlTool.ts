import type {JsonSchema} from "@jsonforms/core";
import {isBooleanControl, isNumberControl, isStringControl, or, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";
import {isIntegerControl} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, JsonFormsUISchema, ToolInterface} from "../models";
import {Tool} from "../models";
import formInputByType from "../../components/tools/formInputByType.vue";
import {
    schema, uischema,
    prepareOptionDataLabel, prepareOptionDataValidation, prepareOptionDataRule,
    setOptionDataValidation, setOptionDataLabel, setOptionDataRule
} from "./schema/toolControl";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";

export const controlTool = new Tool('Control');

controlTool.tester = rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl));
controlTool.importer = () => formInputByType;
controlTool.optionJsonforms = async (tool) : Promise<JsonFormsInterface> => {
    return {
        schema:await resolveSchema(schema),
        uischema:await resolveSchema(uischema),
    }
};

controlTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.schema as JsonSchema;
    const uischema = tool.uischema as ControlElement;

    //default schema
    schema.type ??= 'string';

    const data = {
        propertyName: tool.propertyName,
        type: schema.type,
        format: schema.format,
        options: uischema.options,

        required: tool.isRequired,
    } as any;

    _.merge(
        data,
        prepareOptionDataValidation(schema, uischema),
        prepareOptionDataLabel(schema, uischema),
        prepareOptionDataRule(schema, uischema),
    )

    return data;
};

controlTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.schema as JsonSchema|Record<string, any>;
    const uischema = tool.uischema as ControlElement;

    updatePropertyNameAndScope(data?.propertyName, tool)

    schema.type = data.type;
    schema.format = data.format;
    uischema.options = data.options ?? {};

    setOptionDataValidation(schema, uischema, data);
    setOptionDataLabel(schema, uischema, data);
    setOptionDataRule(schema, uischema, data);

    tool.isRequired = data.required;
};


/**
 * :TODO if schema is Readonly then some props are also readonly
 *       if(props.schemaReadOnly) {
 *         const readOnlyOptions = ['propertyName', 'type', 'format'];
 *         readOnlyOptions.forEach(name => lodashSet(jsonFormsOption,'schema.properties.'+ name +'.readOnly', true));
 *       }
 */

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



