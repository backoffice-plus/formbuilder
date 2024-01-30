import type {JsonSchema} from "@jsonforms/core";
import {and, isEnumControl, isOneOfControl, isStringControl, or, rankWith, schemaTypeIs, schemaMatches} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";

import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {schema, uischema} from "./schema/select.schema";
import {resolveSchema} from "../formbuilder";
import * as _ from 'lodash-es';
import * as subschemas from "./subschemas";
import {UiOptions} from "@/lib";


export class SelectTool extends AbstractTool implements ToolInterface {

    // constructor(uischemaType: string = 'Control', toolType: string | undefined = 'select') {
    //     super(uischemaType, toolType);
    //
    //     this.schema = {
    //         type: 'string',
    //         //oneOf: [{const:"a",title:"A"}],
    //        // enum: [''],
    //     }
    // }

    importer = () => formInputByType;
    tester = rankWith(3,

        or(
            //single select
            and(isStringControl, or(isOneOfControl, isEnumControl)),//TODO: isOneOfEnumControl needed?

            //multi select
            and(
                schemaTypeIs('array'),
                schemaMatches(schema => true === schema?.uniqueItems),
                (uischema, schema, context) => {
                    return isOneOfControl(uischema, schema.items as JsonSchema, context)
                        || isEnumControl(uischema, schema.items as JsonSchema, context);
                }
            )
        )
    );

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        // if(!this.schema.enum && !this.schema.oneOf) {
        //     this.schema.enum = [''];
        // }
    }

    availableUiOptions():UiOptions|undefined {
        return {
            format: {type: "string", enum: ['radio']},
            readonly: {type:"boolean", default:false},
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const schema = this.schema as JsonSchema;
        const uischema = this.uischema as ControlElement;

        const isUischema = 'uischema' === context?.builder;
        const asMultiSelect = 'array' === schema.type && true === schema.uniqueItems;

        let uidata = {};
        if(isUischema) {
            uidata = {
                ...subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
                ...subschemas.prepareOptionUiOptions(context, this),
            }
        }

        /** @ts-ignore **/
        const schemaTypeOrItemsType = schema.items?.type ?? schema.type;

        const data = {
            propertyName: this.propertyName,
            schema: {
                type: schemaTypeOrItemsType,//schema.type,
                format: schema.format,
            },

            required: this.isRequired,

            ...subschemas.prepareOptionDataValidation(context, schema, uischema),
            ...subschemas.prepareOptionDataLabel(context, schema, uischema),
            ...subschemas.prepareOptionDataconditional(context, this.schema, this.uischema),
            ...uidata,

            _isUischema:isUischema,
            _isProperty: 'object' === this.edge.schemaParent?.schema?.type,
            asMultiSelect: asMultiSelect,
        } as any;


        const enumOrOneOf = (asMultiSelect ? schema.items : schema) as JsonSchema;
        if ("enum" in enumOrOneOf) {
            data.enumOrOneOf = {enum: enumOrOneOf.enum};
        } else if ("oneOf" in enumOrOneOf) {
            data.enumOrOneOf = {oneOf: enumOrOneOf.oneOf};
        }


        return data;
    }


    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        const schema = this.schema as JsonSchema | Record<string, any>;
        const uischema = this.uischema as ControlElement;

        const isUischema = 'uischema' === context?.builder;

        this.propertyName = data?.propertyName ?? '';
        this.uischema && (this.uischema.scope = '#/properties/'+ this.propertyName);

        const schemaType = data.type ?? 'string';

        this.schema.type = data.asMultiSelect ? 'array' : schemaType;
        this.schema.format = data.format;

        if(isUischema) {
            subschemas.setOptionDataRule(this.schema, this.uischema, data);
            subschemas.setOptionDataUiOptions(context, this, data);
        }

        subschemas.setOptionDataValidation(schema, uischema, data);
        subschemas.setOptionDataconditional(this.schema, this.uischema, data);
        subschemas.setOptionDataLabel(schema, uischema, data);

        this.schema.uniqueItems = data.asMultiSelect ? true : undefined;

        this.isRequired = data.required;

        //create enumOrOneOf
        const enumOrOneOf = {} as any;
        if (data?.enumOrOneOf) {
            if ("enum" in data?.enumOrOneOf) {
                enumOrOneOf.enum = data?.enumOrOneOf.enum;
            } else if ("oneOf" in data?.enumOrOneOf) {
                enumOrOneOf.oneOf = (data.enumOrOneOf.oneOf ?? []).filter((item: any) => item?.const)
                if (!enumOrOneOf.oneOf.length) {
                    enumOrOneOf.oneOf = [{const: ''}];
                }
                delete enumOrOneOf.type;
            }
        }
        if(!enumOrOneOf.enum && !enumOrOneOf.oneOf) {
            enumOrOneOf.enum = [''];
        }

        //set enumOrOneOf
        this.schema.oneOf && delete this.schema.oneOf;
        this.schema.enum && delete this.schema.enum;
        this.schema.items && delete this.schema.items;
        if(data.asMultiSelect) {
            enumOrOneOf.type = 'array' !== schemaType ? schemaType : 'string'
            this.schema.items = enumOrOneOf;
        }
        else {
            this.schema = {...this.schema,  ...enumOrOneOf}
        }
    }


    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema, undefined, this, context),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new SelectTool(this.uischema.type);
    }

    toolbarOptions():Record<string, any> {
        return {
            title:'Control',
            icon:'mdi:form-select',
            hideIconAtDropArea:true,
            labelAtDropArea:'Control'

        }
    }
}


export const selectTool = new SelectTool()
