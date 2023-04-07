import type {ToolInterface} from "./models";
import {getPlainProperty, getRequiredFromSchema, normalizePath, normalizeScope} from "./normalizer";
import _ from "lodash";
import {unknownTool} from "./tools/unknownTool";
import {cloneToolWithSchema} from "./toolCreation";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {CombinatorTool} from "./tools/combinatorTool";
import type {ToolFinder} from "./ToolFinder";

export const initElements = (toolFinder: ToolFinder, tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

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

            clone = cloneToolWithSchema(toolFinder.findMatchingTool(tool.schema, itemSchema, itemUischema), itemSchema, itemUischema)
            clone.propertyName = normalizePath(propertyPath);

            //required
            const required = getRequiredFromSchema(clone.propertyName, tool.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }
        }
        else {
            clone = cloneToolWithSchema(toolFinder.findLayoutToolByUiType(itemUischema.type) ?? unknownTool, tool.schema, itemUischema);
        }

        tools.push(clone);
    });

    //:TODO remove
    //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

    return tools;
};


export const initArrayElements = (toolFinder: ToolFinder, tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }


    let items =  tool.schema?.items as any[];
    if(!_.isArray(items)) {
        items = [items];
    }

    items.forEach((item:JsonSchema) => {
        const uischema = {type: 'Control', scope: '#'} as UISchemaElement;
        const clone = toolFinder.findMatchingToolAndClone({}, item, uischema);

        tools.push(clone);
    })

    return tools;

    ///////////////////////
    //    //
    // const isItemsObject = 'object' === typeof tool.schema?.items;
    // const isItemsNotEmpty = isItemsObject && !_.isEmpty(tool.schema?.items)
    // /** @ts-ignore */
    // const itemsType = tool.schema?.items?.type
    // /** @ts-ignore */
    // const isItemsTypeObject = isItemsNotEmpty && isItemsObject;
    // /** @ts-ignore */
    // const properties = tool.schema?.items?.properties;
    //
    // // if(tool instanceof ArrayTool) {
    // //     tool.isInlineType = itemsType && ['string', 'number', 'integer', 'bool'].includes(itemsType)
    // // }
    //
    // console.log("initArrayElements", tool,tool.schema?.items)
    // /**
    //  * Array of Object
    //  *   items: {  type: 'object', properties: { ... } }*
    //  */
    // if(isItemsTypeObject) {
    //     properties && Object.keys(properties).forEach((propertyName:string) => {
    //         const itemSchema = properties[propertyName];
    //
    //         const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
    //         const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
    //         clone.propertyName = propertyName;
    //
    //         //required
    //         const required = getRequiredFromSchema(clone.propertyName, tool.schema);
    //         if (required?.includes(getPlainProperty(clone.propertyName))) {
    //             clone.isRequired = true;
    //         }
    //
    //         //console.info("initArrayElements", 'push Array of Object', clone.propertyName)
    //         tools.push(clone);
    //     });
    // }
    // /**
    //  * Array of Schema
    //  *   items: {  type: 'string' }
    //  *   items: {  $ref: '#/...' }
    //  *   items: {  oneOf: [...] }
    //  */
    // else if(isItemsNotEmpty) {
    //     const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
    //     /** @ts-ignore */
    //     const clone = cloneToolWithSchema(findMatchingTool({}, tool.schema?.items, uischema), tool.schema?.items, uischema)
    //     tools.push(clone);
    // }
    // else {
    //     console.log("HIERER");
    // }



    //return tools;
};

export const initCombinatorElements = (toolFinder: ToolFinder, tool: ToolInterface): Array<ToolInterface> => {
    const ctools = [] as any;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    /** @ts-ignore */
    const schemaOfKeyword = CombinatorTool.getKeywordSchemas(tool.schema)

    schemaOfKeyword && schemaOfKeyword.forEach((itemSchema:JsonSchema) => {

        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)

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

export const initObjectElements = (toolFinder: ToolFinder, tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as Array<ToolInterface>;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }


    const properties = tool.schema?.properties ?? {};
    !_.isEmpty(properties) && Object.keys(properties).forEach((propertyName:string) => {
        const itemSchema = properties[propertyName];
        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        //const clone = cloneToolWithSchema(schemaTool, itemSchema, {});
        const clone = cloneToolWithSchema(toolFinder.findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
        clone.propertyName = propertyName;

        //required
        const required = getRequiredFromSchema(clone.propertyName, tool.schema);
        if (required?.includes(getPlainProperty(clone.propertyName))) {
            clone.isRequired = true;
        }

        tools.push(clone);
    });

    //:TODO remove
    //schemaKeywords.forEach(key => key in tool.schema && tools.push(cloneToolWithSchema(new SchemaTool(key), (tool.schema as any)[key])));

    return tools;
};


export const initSchemaElements = (toolFinder: ToolFinder, tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as Array<ToolInterface>;

    //for moving existing tools to another list
    if(tool.childs?.length) {
        return tool.childs;
    }

    const uischema = {type:'Control',scope:'#'} as UISchemaElement;

    const properties = tool.schema
    const propertyKeys = Object.keys(tool.schema)

    propertyKeys.forEach((propertyName:string) => {

        const propertyData = properties[propertyName];
        let clone, itemSchema;

        switch (propertyName) {
            case "$defs":
            case "properties":
            case "definitions":
            case "patternProperties":
            case "dependencies":
                itemSchema = {
                    type: 'object',
                    properties: propertyData
                }
                clone = toolFinder.findMatchingToolAndClone({}, itemSchema, uischema);
                clone.propertyName = propertyName;
                tools.push(clone);

                break;

            case "allOf":
            case "anyOf":
            case "oneOf":
            case "items":
                itemSchema = {
                    type: 'array',
                    items: propertyData
                }
                clone = toolFinder.findMatchingToolAndClone({}, itemSchema, uischema);
                clone.propertyName = propertyName;
                tools.push(clone);
                break;

            default:
                break;
        }
    });

    return tools;
};
