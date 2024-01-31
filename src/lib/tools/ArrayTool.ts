import {rankWith} from '@jsonforms/core';
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import toolComponent from "../../components/tools/array.component.vue";
import {BuilderMode, createResolvedJsonForms, resolveSchema} from "../formbuilder";
import * as _ from 'lodash-es';
import {AbstractTool} from "./AbstractTool";
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import {schema, uischemaModeBoth, uischemaModeSchema, uischemaModeUi} from "@/tools/ArrayTool";
import {BuilderModeType} from "../models";
import {ControlTool} from "@/lib/tools/controlTool";
import {UiOptions} from "@/lib";

export class ArrayTool extends ControlTool {

    /** @deprecated **/
    isInlineType: boolean = false;
    //isSchemaItem: boolean = false; //items is not array

    importer = () => toolComponent;
    //tester = rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl));//not working for $ref (we want unresolved schema)
    tester = rankWith(3, (uischema, schema, rootSchema) => 'array' === schema?.type && 'object' === typeof schema?.items);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type = 'array';

        if (undefined === this.schema.items) {
            //this.schema.items = {type: 'object'} //:INFO do not set type (it breaks $ref)
            this.schema.items = {}
        }
    }

    availableUiOptions():UiOptions|undefined {
        return {
            elementLabelProp:{"type":"string"}
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {
        const data:any = super.optionDataPrepare(context);

        //const isRef = '$ref' in (this.schema?.items as JsonSchema);

        /**
         * add readOnly Schema for "options.detail"
         */
        let readOnlySchema;
        const firstChild = this.edge.childs[0];
        if('object' === firstChild?.schema?.type) {
            readOnlySchema = firstChild.generateJsonSchema();
        }
            //:TODO: disable asInlineType if tool has no childs!

        return {
            ...data,
            ...{
               //isRef: isRef,
                _readOnlySchema: readOnlySchema,
            }
        }
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        super.optionDataUpdate(context, data);

        //this.isInlineType = data?.asInlineType;

        // const hasChilds = tool.childs?.length > 0;
        //
        // if(hasChilds) {
        //     const firstChild = tool.childs[0];
        //     const asInlineType = data?.asInlineType ?? false;
        //
        //     /** @ts-ignore */
        //     const isRef = '$ref' in this.schema?.items;
        //     const childIsRef = firstChild.schema.items && '$ref' in firstChild.schema?.items;
        //
        //     let inlineType = getItemsType(this.schema);
        //     if(!isRef) {
        //         if (asInlineType) {
        //             if('object' === inlineType || !inlineType) {
        //                 inlineType = 'string'
        //             }
        //         } else {
        //             inlineType = 'object';
        //         }
        //         _.set(this.schema, 'items.type', inlineType);
        //     }
        //     console.log("arrayTOol optionDataUpdate",{isRef,childIsRef},firstChild)
        // }


        //this.isRequired = data.required;
        //this.isSchemaItem = data._asSchema;
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
        return new ArrayTool(this.uischema.type);
    }

    toolbarOptions(): Record<string, any> {
        return {
            title: 'Array',
            icon: 'mdi:code-array',

        }
    }
    generateJsonSchema(): JsonSchema|undefined {

        let isInlineType;
        let allowInlineType = false;
        // if(tool instanceof ArrayTool) {
        //     isInlineType = tool.isInlineType;
        // }

        const hasChilds = this.childs?.length > 0;
        const hasOneChild = this.childs?.length === 1;
        const parentIsSchema = false;

        // if(hasOneChild && isInlineType) {
        //     allowInlineType = true
        // }

        let items = {
            type: 'null',
        } as JsonSchema|JsonSchema[];


        if (hasChilds) {
            const schemas = this.childs
                .map((childTool: ToolInterface) => childTool.generateJsonSchema())
                .filter(schema => schema) as JsonSchema[];

            if(parentIsSchema) {
                items = schemas;
            }
            else {
                //use only the first child (it that correct?!)
                items = schemas[0];
            }
        }

        const addToSchema = {} as any;
        ['uniqueItems'].forEach((key:string) => {
            /** @ts-ignore **/
            if(undefined !== this.schema[key]) {
                /** @ts-ignore **/
                addToSchema[key] = this.schema[key];
            }
        })

        return {
            ...this.schema, //must be enabled to get all schema data from tool.optionDataUpdate
            ...addToSchema,
            type: 'array',
            items: items,
        } as JsonSchema;
    }

    initChilds(toolFinder: ToolFinderInterface, baseSchemaTool: ToolInterface | undefined = undefined): ToolInterface[] {
        const tools = [] as ToolInterface[];

        //for moving existing tools to another list
        if(this.edge.childs?.length || this.edge.childsInitialized) {
            return this.edge.childs;
        }


        //items can be schema instead of schemas[]
        let items =  this.schema?.items as any[];
        if(_.isEmpty(items)) {
            items = []
        }
        else if(!_.isArray(items)) {
            items = [items];
        }

        items.forEach((item:JsonSchema) => {
            const uischema = {type: 'Control', scope: '#'} as UISchemaElement;
            const clone = toolFinder.findMatchingToolAndClone({}, item, uischema);

            clone.edge.setParent(this);
            clone.edge.replaceChilds(clone.initChilds(toolFinder));

            tools.push(clone);
        })

        return tools;
    }
}

export const arrayTool = new ArrayTool()
