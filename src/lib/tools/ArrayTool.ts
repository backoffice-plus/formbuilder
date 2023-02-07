import type {RankedTester,} from "@jsonforms/core";
import {isObjectArrayControl, isPrimitiveArrayControl, or, rankWith} from '@jsonforms/core';
import type {JsonFormsInterface, ToolInterface} from "../models";
import {AbstractTool, scalarTypes,} from "../models";
import toolComponent from "../../components/tools/array.component.vue";
import {schema, uischema} from "./schema/array.schema";
import {resolveSchema, updatePropertyNameAndScope} from "../formbuilder";
import _ from "lodash";

export class ArrayTool extends AbstractTool implements ToolInterface {

    importer = () => toolComponent;
    //tester = rankWith(3, or(isObjectArrayControl, isPrimitiveArrayControl));//not working for $ref (we want unresolved schema)
    tester = rankWith(3,(uischema, schema, rootSchema) => 'array' === schema?.type && 'object' === typeof schema?.items);

    optionDataPrepare(tool: ToolInterface): Record<string, any> {
        this.schema.type = 'array';
        if(undefined === this.schema.items) {
            this.schema.items = {type:'object'}
        }

        // let items = {...this.schema?.items};
        //
        // const hasRef = undefined !== items?.$ref
         const hasItemType = undefined !== this.schema.items?.type;
         const itemsType = this.schema.items?.type;
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


        const data = {
            propertyName: tool.propertyName,
            singleChild: 'object' !== itemsType,
            options: this.uischema?.options ?? {}
        } as any;

        return data;
    }

    optionDataUpdate(tool: ToolInterface, data: Record<string, any>): void {
        updatePropertyNameAndScope(data?.propertyName, tool)

        const isSingleChild = data?.singleChild ?? false;

        if(isSingleChild) {
            if(this.schema?.items?.type) {
                delete this.schema.items.type;
            }
        }
        else {
            _.set(this.schema,'items.type','object');
        }

        //this.schema.items = data?.items;

        // //items.type
        // let itemsType = data?.items?.type;
        // const isItemsScalar = scalarTypes.includes(itemsType);
        //
        // //type
        // const isScalar = scalarTypes.includes(data.type);
        // const canHaveChilds = !isScalar && 'object'===itemsType;
        //
        // //items.type
        // if(!isScalar) {
        //     if(itemsType && canHaveChilds) {
        //         if(undefined === this.schema.items) {
        //             this.schema.items = {type:itemsType}
        //         }
        //         else {
        //             this.schema.items.type = itemsType;
        //         }
        //     }
        //
        //     if (undefined !== data.items._reference) {
        //         this.schema.items = {$ref: data.items._reference};
        //     }
        // }
        //
        // const isItemsExists = undefined !== this.schema?.items;
        // const isItemsEmpty = isItemsExists && !Object.keys(this.schema?.items);
        // const isPropertiesExists = isItemsExists && undefined !== this.schema?.items?.properties;
        //
        // //remove items.properties
        // if(isPropertiesExists && isItemsScalar) {
        //     delete this.schema.items.properties;
        // }
        //
        // //remove items object (empty or not necessary)
        // if(isItemsExists && (isScalar || (!canHaveChilds && isItemsEmpty)) ) {
        //     delete this.schema.items;
        // }

        this.uischema.options = data.options ?? {};
    }

    async optionJsonforms(tool: ToolInterface): Promise<JsonFormsInterface> {
        return {
            schema: await resolveSchema(schema),
            uischema: await resolveSchema(uischema),
        } as JsonFormsInterface
    }

    clone(): ToolInterface {
        return new ArrayTool(this.uischema.type, this.toolType);
    }
}

export const itemsTool = new ArrayTool('Control', 'array')
