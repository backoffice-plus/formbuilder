import {ToolInterface} from "./models";
import {JsonSchema} from "@jsonforms/core";

export const findAllScopablePaths = (baseTool:ToolInterface, parentPath='#') => {

    const currentProperties = baseTool?.edge.childs.map((item):string[] => {
        //const currentPath = (parentPath ? parentPath+'.' : '')+ item.propertyName;
        const currentPath = (parentPath ? parentPath+'/properties/' : '')+ item.propertyName;

        if('object' === item.schema.type) {
            return [
                currentPath,
                ...findAllScopablePaths(item, currentPath),
            ].flat()
        }
        return [currentPath]
    });

    return currentProperties.flat()
}

export const findAllScopablePathsBySchema = (schema?:JsonSchema, parentPath='#') => {

    const currentProperties = Object.keys(schema?.properties ?? {}).map((propertyName):string[] => {
        const item = schema?.properties?.[propertyName];
        //const currentPath = (parentPath ? parentPath+'.' : '')+ item.propertyName;
        const currentPath = (parentPath ? parentPath+'/properties/' : '')+ propertyName;

        if('object' === item?.type) {
            return [
                currentPath,
                ...findAllScopablePathsBySchema(item, currentPath),
            ].flat()
        }
        return [currentPath]
    });

    return currentProperties.flat()
}
