import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolInterface} from "./models";

export const setRequiredToSchema = (propertyName: string, schema: JsonSchema, isRequired: boolean = false): void => {
    const plainProp = getPlainProperty(propertyName);
    let required = getRequiredFromSchema(propertyName, schema);
    if (isRequired) {
        if (!required.includes(plainProp)) {
            required.push(plainProp);
        }
    } else {
        if (required.includes(plainProp)) {
            required = required.filter((item: string) => item !== plainProp)
        }
    }
    _.set(schema, getRequiredPath(propertyName), required.length ? required : undefined)
}
export const setItemSchemaToSchema = (tool: ToolInterface, rootSchema: JsonSchema): void => {

    let set = tool.generateJsonSchema();
    if(undefined === set) {
        return
    }

    //console.log("setItemSchemaToSchema",tool,rootSchema);

    const subpaths = getAllSubpaths(tool.propertyName, 0);

    //create type=object in subpaths if not exists
    subpaths.forEach((subProp: string) => {
        const subPath = denormalizePath(subProp) + '.type'
        if (!_.get(rootSchema, subPath)) {
            _.set(rootSchema, subPath, 'object')
        }
    });

    let path = denormalizePath(tool.propertyName);

    // //array items :TODO find better implementation (its not working for multiple nested objects)
    // const isRef = undefined !== tool?.schema?.items?.$ref;
    // if('array' === tool?.schema?.type && undefined === tool?.schema?.items?.type && !isRef ) {
    //     set.items = {type:'object'}
    // }
    // if('array' === parentTool?.schema?.type) {
    //     path = path.replace(/^properties\./, 'items.properties.');
    // }

    _.set(rootSchema, path, set)

    if (tool.isRequired) {
        setRequiredToSchema(tool.propertyName, rootSchema, true);
    }
}


export const createJsonUiSchema = (tool: ToolInterface, rootSchema: JsonSchema, schemaReadOnly: boolean = false): JsonFormsUISchema => {
    if (_.isEmpty(tool.uischema.options)) {
        delete tool.uischema.options;
    }

    const uischema = tool.uischema;

    const clonedUischema = uischema && "type" in uischema && _.cloneDeep(uischema) as JsonFormsUISchema | any;
    const isScoped = clonedUischema && "scope" in clonedUischema;

    if(!isScoped) {
        if(tool.childs.length) {
            clonedUischema.elements = tool.childs.map((t: ToolInterface) => createJsonUiSchema(t, rootSchema, schemaReadOnly)) ?? [];
        }
    }
    else if (!schemaReadOnly) {
       setItemSchemaToSchema(tool, rootSchema);
    }

    return clonedUischema;
};
