import {ToolInterface} from "./models";
import {JsonSchema} from "@jsonforms/core";
import * as _ from "lodash-es";

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

/**
 *
 * isNotEmpty(undefined) -> false
 * isNotEmpty({}) -> false
 * isNotEmpty([]) -> false
 * isNotEmpty('') -> false
 *
 *
 * isNotEmpty(1) -> true
 * isNotEmpty('1') -> true
 * isNotEmpty(true) -> true
 * isNotEmpty([1]) -> true
 * isNotEmpty({a:1}) -> true
 */
export const isNotEmpty = (value?:any):boolean => {
    const hasValue = undefined !== value && null !== value
    let hasLength = false;

    if(hasValue) {
        switch (typeof value) {
            case "object" : hasLength = !_.isEmpty(value); break;
            case "string" :
                hasLength = !!value.length;
                break;
            default:
                hasLength = true
                break;
        }
    }

    return hasLength;
}
