import {rankWith} from '@jsonforms/core';
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface, ToolContext, ToolFinderInterface, ToolInterface} from "../models";
import toolComponent from "../../components/tools/array.component.vue";
import {schema, uischema} from "./schema/array.schema";
import jsonFormsSchema from "./schema/array.schemaBuilder.form.json";
import jsonFormsAsSchemaChild from "./schema/array.asSchemaChild.form.json";
import {getItemsType, resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";
import {AbstractTool} from "./AbstractTool";
import * as subschemas from "./subschemas";
import {SchemaTool} from "./SchemaTool";
import jsonFormAsSchemaChild from "./schema/object.asSchemaChild.form.json";

export class ArrayTool extends AbstractTool implements ToolInterface {

    /** @deprecated **/
    isInlineType: boolean = false;
    isSchemaItem: boolean = false; //items is not array

    importer = () => toolComponent;
    //tester = rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl));//not working for $ref (we want unresolved schema)
    tester = rankWith(3, (uischema, schema, rootSchema) => 'array' === schema?.type && 'object' === typeof schema?.items);

    constructor(uischemaType: string = 'Control') {
        super(uischemaType);

        this.schema.type ??= 'array';

        if (undefined === this.schema.items) {
            //this.schema.items = {type: 'object'} //:INFO do not set type (it breaks $ref)
            this.schema.items = {}
        }
    }

    optionDataPrepare(context: ToolContext): Record<string, any> {

        // let items = {...this.schema?.items};
        //
        // const hasRef = undefined !== items?.$ref

        /** @ts-ignore **/
        const itemsType = this.schema?.items?.type;
        /** @ts-ignore **/
        const isRef = '$ref' in this.schema?.items;
        const asSchema = undefined !== itemsType;


        /**
         * Array of Strings
         */
        /** @ts-ignore **/
        //let couldBeInlineType = false;
        // if(itemsType) {
        //     couldBeInlineType = itemsType && ['string', 'number', 'integer', 'bool'].includes(itemsType)
        //
        //     //init from existing schema (:TODO find better solution)
        //     this.isInlineType = couldBeInlineType;
        // }

        // const canHaveChilds = true;//:TODO need new "canHaveObject"
        //
        // if(canHaveChilds && !hasItemType && !hasRef) {
        //     if(undefined === items) {
        //         items = {};
        //     }
        //     items.type = this.schema.items?.type ?? 'object'
        // }
        //
        // if (hasRef) {
        //     items._reference = items.$ref;
        //     delete items.$ref;//must be delete otherwise oneOf will not work
        // }


        //convert option.detail.elements
        const options = {...this.uischema?.options ?? {}}
        if(options?.detail?.elements) {
            options.detail.elements = JSON.stringify(options.detail.elements);
        }

        /**
         * :BUG https://github.com/eclipsesource/jsonforms/issues/1917
         * @see https://jsonforms.io/docs/uischema/controls/#label-for-array-elements-elementlabelprop
         * prefer elementLabelProp over childLabelProp
         */
        if('childLabelProp' in options) {
            options.elementLabelProp = options.childLabelProp;
        }

        //:TODO: disable asInlineType if tool has no childs!

        const data = {
            propertyName: this.propertyName,
            type: this.schema.type,
            //asInlineType: couldBeInlineType,
            isRef: isRef,
            options: options,
            _asSchema: asSchema,

            _isUischema: 'uischema' === context.builder,
            _isSchemaReadOnly: context.schemaReadOnly,
        } as any;


        _.merge(
            data,
            subschemas.prepareOptionDataValidation(context, this.schema, this.uischema),
            subschemas.prepareOptionDataLabel(context, this.schema, this.uischema),
            subschemas.prepareOptionDataRule(context, this.schema, this.uischema),
            subschemas.prepareOptionDataStyles(context, this.schema, this.uischema),
        )

        return data;
    }

    optionDataUpdate(context: ToolContext, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, this)

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


        const options = {...data.options ?? {}};

        //convert option.detail.elements
        if(options?.detail?.elements) {
            let parsed =[];
            try {
                parsed = JSON.parse(options.detail.elements);
            }
            catch (e) {
                parsed = [];
            }
            options.detail.elements = parsed;
        }

        this.uischema.options = options;

        subschemas.setOptionDataValidation(this.schema, this.uischema, data);
        subschemas.setOptionDataLabel(this.schema, this.uischema, data);
        subschemas.setOptionDataRule(this.schema, this.uischema, data);
        subschemas.setOptionDataStyles(this.schema, this.uischema, data);

        //this.isRequired = data.required;
        this.isSchemaItem = data._asSchema;
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {

        let currentJsonSchema = {
            schema: schema,
            uischema: uischema,
        }
        if('schema' === context.builder) {
            currentJsonSchema = jsonFormsSchema;
        }

        const parentTool = this.parentTool;
        if(parentTool instanceof SchemaTool) {
            currentJsonSchema = jsonFormsAsSchemaChild;
        }

        return {
            schema: await resolveSchema(currentJsonSchema.schema),
            uischema: await resolveSchema(currentJsonSchema.uischema),
        } as JsonFormsInterface
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
        const parentIsSchema = this.parentTool instanceof SchemaTool;

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

    initChilds(toolFinder: ToolFinderInterface): ToolInterface[] {
        const tools = [] as ToolInterface[];

        //for moving existing tools to another list
        if(this.childs?.length) {
            return this.childs;
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
            tools.push(clone);
        })

        return tools;
    }
}

export const arrayTool = new ArrayTool()
