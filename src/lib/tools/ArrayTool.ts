import {rankWith} from '@jsonforms/core';
import type {JsonFormsInterface, ToolContext, ToolInterface} from "./index";
import toolComponent from "../../components/tools/array.component.vue";
import {schema, uischema} from "./schema/array.schema";
import {getItemsType, resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";
import {AbstractTool} from "./AbstractTool";
import {
    prepareOptionDataLabel,
    prepareOptionDataRule,
    prepareOptionDataValidation, setOptionDataLabel, setOptionDataRule,
    setOptionDataValidation
} from "./schema/control.schema";

export class ArrayTool extends AbstractTool implements ToolInterface {

    /** @deprecated **/
    isInlineType: boolean = false;

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

        //:TODO: disable asInlineType if tool has no childs!

        const data = {
            propertyName: this.propertyName,
            type: this.schema.type,
            //asInlineType: couldBeInlineType,
            isRef: isRef,
            options: options
        } as any;


        _.merge(
            data,
            prepareOptionDataValidation(context, this.schema, this.uischema),
            prepareOptionDataLabel(context, this.schema, this.uischema),
            prepareOptionDataRule(context, this.schema, this.uischema),
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

        setOptionDataValidation(this.schema, this.uischema, data);
        setOptionDataLabel(this.schema, this.uischema, data);
        setOptionDataRule(this.schema, this.uischema, data);

        //this.isRequired = data.required;
    }

    async optionJsonforms(context: ToolContext): Promise<JsonFormsInterface | undefined> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
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
}

export const arrayTool = new ArrayTool()
