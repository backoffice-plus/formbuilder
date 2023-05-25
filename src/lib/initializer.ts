import type {ToolInterface} from "./models";
import {getPlainProperty, getRequiredFromSchema, normalizePath, normalizeScope} from "./normalizer";
import _ from "lodash";
import {unknownTool} from "./tools/unknownTool";
import {cloneToolWithSchema} from "./toolCreation";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
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
