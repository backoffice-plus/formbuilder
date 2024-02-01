import {isBooleanControl, isNumberControl, isStringControl, or, rankWith} from "@jsonforms/core";
import type {Categorization, JsonSchema} from "@jsonforms/core";
import {isIntegerControl} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface, BuilderModeType} from "../models";
import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi} from "@/tools/SimpleTypeTool";
import {BuilderMode, createResolvedJsonForms, resolveSchema} from "../formbuilder";
import * as _ from 'lodash-es';
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import {JsonSchemaDraft07} from "../models";
import {UiOptions, UiOptionsByType} from "@/lib";


export class ControlTool extends AbstractTool implements ToolInterface {

    importer = () => formInputByType;
    tester = rankWith(1, or(isStringControl, isBooleanControl, isNumberControl, isIntegerControl));

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'string';
    }

    availableUiOptions():UiOptions|undefined {
         return {
             readonly: {type:"boolean", default:false},
             multi: {type:"boolean", default:false},
             toggle: {type:"boolean", default:false},
             placeholder: {type:"string", default:""},
             showUnfocusedDescription: {type:"boolean", default:false},
         }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        let dataSubschemas = {
            ...subschemas.prepareOptionDataLabel(context, this),
        };
        if(context.isBuilderMode?.schema) {
            dataSubschemas = {
                ...dataSubschemas,
                ...subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
                ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            }
        }
        if(context.isBuilderMode?.uischema) {
            dataSubschemas = {
                ...dataSubschemas,
                ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
                ...subschemas.prepareOptionUiOptions(context, this),
            }
        }

        return {
            propertyName: this.propertyName,

            required: this.isRequired,

            schema: {
                type: this.schema.type,
                format: this.schema.format,
                contentMediaType: (this.schema as JsonSchemaDraft07).contentMediaType,
                contentEncoding: (this.schema as JsonSchemaDraft07).contentEncoding,
            },

            ...dataSubschemas,

            _isUischema: 'uischema' === context.builder,
            _isSchemaOnly: context.schemaOnly,
            _isSchemaReadOnly: context.schemaReadOnly,
            _isProperty: 'object' === this.edge.schemaParent?.schema?.type
        } as any;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);

        subschemas.setOptionDataLabel(context, this, data);

        if(context.isBuilderMode?.schema) {
            this.schema.type = data.schema.type;
            this.schema.format = data.schema.format;
            (this.schema as JsonSchemaDraft07).contentMediaType = data.schema.contentMediaType;
            (this.schema as JsonSchemaDraft07).contentEncoding = data.schema.contentEncoding;
            subschemas.setOptionDataValidation(this.schema, this.uischema, data);
            subschemas.setOptionDataconditional(this.schema, this.uischema, data);
        }

        if(context.isBuilderMode?.uischema) {
            subschemas.setOptionDataRule(this.schema, this.uischema, data);
            subschemas.setOptionDataUiOptions(context, this, data);
        }

        this.isRequired = data.required;
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let uischemas:Record<BuilderModeType, any> = {
            [BuilderMode.BOTH]:uischemaModeBoth,
            [BuilderMode.SCHEMA]:uischemaModeSchema,
            [BuilderMode.UI]:uischemaModeUi,
        };

        return createResolvedJsonForms([
            resolveSchema(schema, undefined, this, context),
            resolveSchema(uischemas[context.builderMode ?? BuilderMode.BOTH])
        ]);
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



