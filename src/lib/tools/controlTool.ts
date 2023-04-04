import {isBooleanControl, isNumberControl, isStringControl, or, rankWith} from "@jsonforms/core";
import type {Categorization, JsonSchema} from "@jsonforms/core";
import {isIntegerControl} from "@jsonforms/core/src/testers/testers";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {schema, uischema,uischemaReadOnly} from "./schema/control.schema";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";
import * as subschemas from "./subschemas";


export class ControlTool extends AbstractTool implements ToolInterface {

    importer = () => formInputByType;
    tester = rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl));

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'string';
    }


    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data = {
            propertyName: this.propertyName,
            type: this.schema.type,
            format: this.schema.format,
            /** @ts-ignore */
            contentMediaType: this.schema?.contentMediaType as any,
            /** @ts-ignore */
            contentEncoding: this.schema?.contentEncoding as any,

            options: this.uischema.options,

            required: this.isRequired,

            _isUischema: 'uischema' === context.builder,
            _isSchemaReadOnly: context.schemaReadOnly,
        } as any;

        _.merge(
            data,
            subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            subschemas.prepareOptionDataLabel(context, this.schema, this.uischema),
            subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
            subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
        )

        // if('uischema' === context.builder) {
        //     _.merge(
        //         data,
        //         {
        //             options: this.uischema.options,
        //         },
        //         prepareOptionDataRule(this.schema, this.uischema),
        //     )
        // }

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

        this.schema.type = data.type;
        this.schema.format = data.format;
        this.uischema.options = data.options ?? {};

        /** @ts-ignore */
        this.schema.contentMediaType = data.contentMediaType;
        /** @ts-ignore */
        this.schema.contentEncoding = data.contentEncoding;

        subschemas.setOptionDataValidation(this.schema, this.uischema, data);
        subschemas.setOptionDataLabel(this.schema, this.uischema, data);
        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataStyles(this.schema, this.uischema, data);
        subschemas.setOptionDataconditional(this.schema, this.uischema, data);

        this.isRequired = data.required;
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {


        let setSchema = JSON.parse(JSON.stringify(schema)) as JsonSchema|any; //deepClone
        let setUischema = JSON.parse(JSON.stringify(uischema)) as Categorization; //deepClone

        if(context.schemaReadOnly) {
            setUischema = JSON.parse(JSON.stringify(uischemaReadOnly)) as JsonSchema|any; //deepClone
        }

        //hide rule in schema/definitions
        if('uischema' !== context.builder) {
            setUischema.elements = setUischema.elements.filter(category => 'Rule' !== category.label);
        }

        // if(context.schemaReadOnly) {
        //     //setSchema.properties.propertyName.readOnly=true;
        //     // setSchema.properties.type.readOnly=true;
        // }

        return {
            schema: await resolveSchema(setSchema),
            uischema: await resolveSchema(setUischema),
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



