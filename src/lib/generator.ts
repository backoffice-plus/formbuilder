import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import {ObjectTool} from "./tools/ObjectTool";

import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolInterface} from "./tools";

// export const generateSchema = (component: any): Record<string, JsonSchema> => {
//
//     //from defineExpose() in tool components
//     const tool = component?.tool as ToolInterface;
//     const childTools = component?.childTools;
//     const childComponents = component?.childComponents;
//
//
//     const schema = {};
//
//
//     return schema;
// }

export const createJsonForms = (tool: ToolInterface, rootSchema: JsonSchema, schemaReadOnly: boolean): JsonFormsInterface => {

    if (!rootSchema) {
        rootSchema = Generate.jsonSchema({})
    }

    const schema = _.clone(rootSchema);
    if (!schemaReadOnly) {
        schema.properties = {}; //clear properties
        schema.required = undefined;
    }

    return {
        schema: schemaReadOnly ? rootSchema : schema,
        uischema: createJsonUiSchema(tool, schema)
    } as JsonFormsInterface;
}
export const createTypeArraySchema = (tool: ToolInterface): Record<string, JsonSchema> => {
    const schemas = {} as Record<string, JsonSchema>;

    /** @ts-ignore */
    if ('object' === tool?.schema?.items?.type) {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        tool.childs.forEach((childTool: ToolInterface) => {
            if ('array' === childTool?.schema?.type) {
                const childSchema = createTypeArraySchema(childTool);
                properties[childTool.propertyName] = childSchema[childTool.propertyName];

            } else {
                properties[childTool.propertyName] = childTool.schema;
            }

            if (childTool.isRequired) {
                required.push(childTool.propertyName);
            }
        });

        schemas[tool.propertyName] = {
            ...tool.schema,
            type: 'array',
            items: {
                type: "object",
                properties: properties,
                required: required.length ? required : undefined,
            }
        } as JsonSchema;

    } else {
        schemas[tool.propertyName] = {
            ...tool.schema,
            type: 'array',
            items: tool.childs?.length ? tool.childs[0].schema : {type: 'null'}
        } as JsonSchema;
    }

    return schemas;
};
export const createTypeObjectSchema = (tool: ToolInterface): Record<string, JsonSchema> => {
    const schemas = {} as Record<string, JsonSchema>;

    if ('object' === tool?.schema?.type) {
        const properties = {} as Record<string, JsonSchema>;
        const required = [] as Array<string>;

        tool.childs?.forEach((childTool: ToolInterface) => {
            if ('object' === childTool?.schema?.type) {
                const childSchema = createTypeObjectSchema(childTool);
                properties[childTool.propertyName] = childSchema[childTool.propertyName];

            } else {
                properties[childTool.propertyName] = childTool.schema;
            }

            if (childTool.isRequired) {
                required.push(childTool.propertyName);
            }
        });

        schemas[tool.propertyName] = {
            type: 'object',
            properties: properties,
            required: required.length ? required : undefined,
        } as JsonSchema;

    }

    return schemas;
};
export const createCombinatorSchema = (tool: ToolInterface): Record<string, JsonSchema> => {
    const keyword = (tool instanceof CombinatorTool && tool.keyword) ?? 'anyOf';

    //:TODO call createJsonSchema instead of returning schena
    const schemas = tool.childs.map((t: ToolInterface) => t.schema);

    const schema = {};
    /** @ts-ignore */
    schema[keyword] = schemas;

    return schema;
};
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

    const subpaths = getAllSubpaths(tool.propertyName, 1);

    //create type=object in subpaths if not exists
    subpaths.forEach((subProp: string) => {
        const subPath = denormalizePath(subProp) + '.type'
        if (!_.get(rootSchema, subPath)) {
            _.set(rootSchema, subPath, 'object')
        }
    });

    let path = denormalizePath(tool.propertyName);
    let set = {...tool.schema};

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
export const createJsonUiSchema = (tool: ToolInterface, rootSchema: JsonSchema): JsonFormsUISchema => {
    const uischema = tool.uischema;

    const created = _.cloneDeep(uischema) as JsonFormsUISchema | any;

    const isScoped = "scope" in created;
    //const isLayout = "elements" in created;

    if (isScoped) {
        if ('array' === tool?.schema?.type) {

            const firstChild = tool.childs[0];
            const isFirstChildLayout = firstChild && 'Control' !== firstChild.uischema.type; //:TODO add better check!

            if (isFirstChildLayout) {
                const subSchema = {type: 'object'};
                const detailSchema = createJsonUiSchema(firstChild, subSchema);

                tool.schema['items'] = subSchema;
                setItemSchemaToSchema(tool, rootSchema);

                created.options['detail'] = detailSchema
            } else {
                const schemasToPush = createTypeArraySchema(tool);
                _.merge(rootSchema, {properties: schemasToPush})
            }

        } else if (tool instanceof ObjectTool) {
            const schemasToPush = createTypeObjectSchema(tool);
            _.merge(rootSchema, {properties: schemasToPush, type: 'object'})
        } else if (tool instanceof CombinatorTool) {
            tool.schema = createCombinatorSchema(tool);
            setItemSchemaToSchema(tool, rootSchema);
        } else {
            setItemSchemaToSchema(tool, rootSchema);
        }
    } else {
        created.elements = tool.childs?.map((t: ToolInterface) => {
            return createJsonUiSchema(t, rootSchema)
        }) ?? [];
    }

    return created;
};
