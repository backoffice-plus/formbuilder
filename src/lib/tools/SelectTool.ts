import type {JsonSchema} from "@jsonforms/core";
import {and, isEnumControl, isOneOfControl, isStringControl, or, rankWith, schemaTypeIs, schemaMatches} from "@jsonforms/core";
import type {ControlElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolInterface} from "../models";
import {AbstractTool} from "./AbstractTool";
import formInputByType from "../../components/tools/formInputByType.vue";
import {BuilderMode, createResolvedJsonForms, resolveSchema} from "../formbuilder";
import * as _ from 'lodash-es';
import * as subschemas from "./subschemas";
import {UiOptions} from "@/lib";
import {ControlTool} from "@/lib/tools/controlTool";
import {BuilderModeType} from "../models";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi} from "@/tools/SelectTool";


export class SelectTool extends ControlTool {

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
            showUnfocusedDescription: {type:"boolean", default:false},
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data:any = super.optionDataPrepare(context);

        if(context.isBuilderMode?.schema) {
            const schema = this.schema as JsonSchema;

            data.schema.type = (schema.items as any)?.type ?? schema.type;
            data.asMultiSelect = 'array' === schema.type && true === schema.uniqueItems;

            const enumOrOneOf = (data.asMultiSelect ? schema.items : schema) as JsonSchema;
            if (enumOrOneOf?.enum?.length) {
                data.enumOrOneOf = {enum: enumOrOneOf.enum};
            } else if (enumOrOneOf?.oneOf?.length) {
                data.enumOrOneOf = {oneOf: enumOrOneOf.oneOf};
            }
        }


        return data;
    }


    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        if(context.isBuilderMode?.schema) {
            const schemaType = data.type ?? 'string';

            this.schema.type = data.asMultiSelect ? 'array' : schemaType;
            this.schema.uniqueItems = data.asMultiSelect ? true : undefined;

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
            let setEnumOrOneOf = {
                oneOf: undefined,
                enum: undefined,
                items: undefined,
            }
            // this.schema.oneOf && delete this.schema.oneOf;
            // this.schema.enum && delete this.schema.enum;
            // this.schema.items && delete this.schema.items;
            if(data.asMultiSelect) {
                enumOrOneOf.type = 'array' !== schemaType ? schemaType : 'string'
                setEnumOrOneOf.items = enumOrOneOf;
            }
            else {
                setEnumOrOneOf = {...setEnumOrOneOf, ...enumOrOneOf}
            }

            this.schema = {...this.schema,  ...setEnumOrOneOf}
        }
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
