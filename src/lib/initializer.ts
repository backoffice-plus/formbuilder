import type {ToolInterface} from "./tools";
import {useTools} from "../composable/tools";
import {getPlainProperty, getRequiredFromSchema, normalizePath, normalizeScope} from "./normalizer";
import _ from "lodash";
import {unknownTool} from "./tools/unknownTool";
import {cloneToolWithSchema, getItemsType} from "./formbuilder";
import {ArrayTool} from "./tools/ArrayTool";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {CombinatorTool} from "./tools/combinatorTool";

export const initElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    tool.uischema?.elements?.forEach((itemUischema: any) => {
        let clone;

        //const isLayout = undefined !== itemUischema.elements
        const isScoped = itemUischema.scope;

        if(isScoped) {
            const propertyPath = normalizeScope(itemUischema.scope);
            const itemSchema = _.get(tool.schema, propertyPath);

            clone = cloneToolWithSchema(findMatchingTool(tool.schema, itemSchema, itemUischema), itemSchema, itemUischema)
            clone.propertyName = normalizePath(propertyPath);

            //required
            const required = getRequiredFromSchema(clone.propertyName, tool.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }
        }
        else {
            clone = cloneToolWithSchema(findLayoutToolByUiType(itemUischema.type) ?? unknownTool, tool.schema, itemUischema);
        }

        tools.push(clone);
    });

    return tools;
};


export const initArrayElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    const isItemsObject = 'object' === typeof tool.schema?.items;
    // @ts-ignore
    const isItemsTypeObject = 'object' === tool.schema?.items?.type;
    /** @ts-ignore */
    const properties = tool.schema?.items?.properties;

    if(tool instanceof ArrayTool) {
        tool.isInlineType = !isItemsTypeObject;
    }

    /**
     * Array of Object
     *   items: {  type: 'object', properties: { ... } }*
     */
    if(isItemsTypeObject) {
        properties && Object.keys(properties).forEach((propertyName:string) => {
            const itemSchema = properties[propertyName];

            const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
            const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
            clone.propertyName = propertyName;

            //required
            const required = getRequiredFromSchema(clone.propertyName, tool.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            //console.info("initArrayElements", 'push Array of Object', clone.propertyName)
            tools.push(clone);
        });
    }
    /**
     * Array of Schema
     *   items: {  type: 'string' }
     *   items: {  $ref: '#/...' }
     *   items: {  oneOf: [...] }
     */
    else {

        const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
        /** @ts-ignore */
        const clone = cloneToolWithSchema(findMatchingTool({}, tool.schema?.items, uischema), tool.schema?.items, uischema)
        tools.push(clone);
    }



    return tools;
};

export const initCombinatorElements = (tool: ToolInterface): Array<ToolInterface> => {
    const ctools = [] as any;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    /** @ts-ignore */
    const schemaOfKeyword = CombinatorTool.getKeywordSchemas(tool.schema)

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    schemaOfKeyword && schemaOfKeyword.forEach((itemSchema:JsonSchema) => {

        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)

        //required
        const required = getRequiredFromSchema(clone.propertyName, tool.schema);
        if (required?.includes(getPlainProperty(clone.propertyName))) {
            clone.isRequired = true;
        }

        //console.info("initArrayElements", 'push Array of Object', clone.propertyName)
        ctools.push(clone);
    });

    return ctools;
};

export const initObjectElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as Array<ToolInterface>;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    const properties = tool.schema?.properties ?? {};
    !_.isEmpty(properties) && Object.keys(properties).forEach((propertyName:string) => {
        const itemSchema = properties[propertyName];
        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        //const clone = cloneToolWithSchema(schemaTool, itemSchema, {});
        const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
        clone.propertyName = propertyName;

        //required
        const required = getRequiredFromSchema(clone.propertyName, tool.schema);
        if (required?.includes(getPlainProperty(clone.propertyName))) {
            clone.isRequired = true;
        }

        tools.push(clone);
    });

    return tools;
};
