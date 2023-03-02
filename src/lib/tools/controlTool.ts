import {isBooleanControl, isNumberControl, isStringControl, or, rankWith} from "@jsonforms/core";
import {isIntegerControl} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolInterface} from "./index";
import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {
    prepareOptionDataLabel,
    prepareOptionDataRule,
    prepareOptionDataValidation,
    schema,
    setOptionDataLabel,
    setOptionDataRule,
    setOptionDataValidation,
    uischema
} from "./schema/toolControl";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";


export class ControlTool extends AbstractTool implements ToolInterface {

    importer = () => formInputByType;
    tester = rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl));

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'string';
    }


    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        const data = {
            propertyName: tool.propertyName,
            type: this.schema.type,
            format: this.schema.format,
            /** @ts-ignore */
            contentMediaType: this.schema?.contentMediaType as any,
            /** @ts-ignore */
            contentEncoding: this.schema?.contentEncoding as any,
            options: this.uischema.options,

            required: tool.isRequired,
        } as any;

        _.merge(
            data,
            prepareOptionDataValidation(this.schema, this.uischema),
            prepareOptionDataLabel(this.schema, this.uischema),
            prepareOptionDataRule(this.schema, this.uischema),
        )

        return data;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

        this.schema.type = data.type;
        this.schema.format = data.format;
        this.uischema.options = data.options ?? {};

        /** @ts-ignore */
        this.schema.contentMediaType = data.contentMediaType;
        /** @ts-ignore */
        this.schema.contentEncoding = data.contentEncoding;

        setOptionDataValidation(this.schema, this.uischema, data);
        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);

        this.isRequired = data.required;
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new ControlTool(this.uischema.type);
    }


    toolbarOptions():Record<string, any> {
        return {
            title:'Control',
            icon:'mdi:form-textbox',
            hideIconAtDropArea:true,
            labelAtDropArea:'Control'

        }
    }

}

export const controlTool = new ControlTool();


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



