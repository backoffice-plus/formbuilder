import type {JsonSchema} from "@jsonforms/core";
import {isBooleanControl, isNumberControl, isStringControl, or, rankWith} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core/src/models/uischema";
import {isIntegerControl} from "@jsonforms/core/src/testers/testers";
import type {ToolInterface} from "../models";
import {Tool, ToolProps} from "../models";
import formInputByType from "../../components/tools/formInputByType.vue";
import {jsonForms as toolOptionsControl} from "../../schema/toolOptionsControl";
import {denormalizeRule} from "../normalizer";
import {updatePropertyNameAndScope} from "../formbuilder";

export const controlTool = new Tool('formInputByType', ToolProps.create({
    toolType: 'control',
    toolName: 'Control',
    jsonForms: {schema: {type: 'string'}, uischema: {type: 'Control'}}
}), rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl)));
controlTool.importer = () => formInputByType;
controlTool.optionJsonforms = toolOptionsControl;

type schemaValidationKey = | 'minimum' | 'maximum' | 'pattern' | 'minLength' | 'maxLength';
type schemaKeyDefault = 'type' | 'format' | 'description' | schemaValidationKey;
type schemaKey = schemaKeyDefault;
const schemaKeys = ['type', 'format', 'description', 'minimum', 'maximum', 'pattern', 'minLength', 'maxLength'] as Array<schemaKey>;
type uiSchemaKey = 'label' | 'i18n' | 'options';
const uiSchemaKeys = ['label', 'i18n', 'options'] as Array<uiSchemaKey>;

controlTool.optionDataPrepare = (tool: ToolInterface) => {
    const schema = tool.props.jsonForms.schema as JsonSchema;
    const uischema = tool.props.jsonForms.uischema as ControlElement;

    const data = {} as any;

    data.propertyName = tool.props.propertyName;

    schemaKeys.forEach(key => {
        if (undefined !== schema[key]) data[key] = schema[key]
    });
    uiSchemaKeys.forEach(key => {
        if (undefined !== uischema[key]) data[key] = uischema[key]
    });

    /**
     * :TODO better modeling without converting
     */
    // if(options?.rule?.condition?.schema) {
    //     options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
    // }


    if(tool.isRequired) {
        data.required = true;
    } 

    return data;
};

controlTool.optionDataUpdate = (tool: ToolInterface, data: any) => {
    const schema = tool.props.jsonForms.schema as JsonSchema|Record<string, any>;
    const uischema = tool.props.jsonForms.uischema as ControlElement;

    const propertyName = updatePropertyNameAndScope(data?.propertyName, tool)

   // console.log("controllTool optionDataUpdate",schema);

    schemaKeys.forEach((key:schemaKey) => schema[key] = data[key]);
    uiSchemaKeys.forEach((key:uiSchemaKey) => uischema[key] = data[key]);

    //:TODO better rule schema without denormalization
    if (undefined !== data.rule) {
        const rule = denormalizeRule(data.rule);
        if (undefined !== rule.condition) {
            uischema.rule = rule;
        }
    }

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



