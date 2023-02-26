import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";

import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolInterface} from "./tools";
import {ArrayTool} from "./tools/ArrayTool";
import {getItemsType} from "./formbuilder";

export const generateSchemaByTool = (tool: ToolInterface): JsonSchema => {

    if ('object' === tool.schema?.type) {
        return createTypeObjectSchemaOnly(tool);
    }

    else if ('array' === tool.schema?.type) {
        return createTypeArraySchemaOnly(tool);
    }

    else  {
        const keyword = CombinatorTool.getKeyword(tool.schema);
        if(keyword) {
            return createCombinatorSchema(tool, keyword);
        }
    }

    return tool.schema;
}


export const generateSchemaForUiSchema = (tool: ToolInterface, rootSchema: JsonSchema): void => {

    const schema = tool?.schema;

    if ('array' === schema?.type) {
        const firstChild = tool.childs[0];
        const isFirstChildLayout = firstChild && 'Control' !== firstChild.uischema.type; //:TODO add better check!

        if (!isFirstChildLayout) {
            setItemSchemaToSchema(tool, rootSchema);
        }
    }
    else if ('object' === schema?.type) {
        //const schemasToPush = createTypeObjectSchema(tool);
        const properties = {
            [tool.propertyName]:  generateSchemaByTool(tool),
        }
        _.merge(rootSchema, {properties: properties, type: 'object'})
    }
    // else if (undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf) {
    //     tool.schema = createCombinatorSchema(tool);
    //     setItemSchemaToSchema(tool, rootSchema);
    // }
    else {
        setItemSchemaToSchema(tool, rootSchema);
    }

}

export const createJsonForms = (tool: ToolInterface, rootSchema: JsonSchema | undefined = undefined, schemaReadOnly: boolean = false): JsonFormsInterface => {

    if (!rootSchema) {
        rootSchema = Generate.jsonSchema({})
        delete rootSchema.additionalProperties;
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

export const cleanSchema = (tool: ToolInterface) => {
    if (_.isEmpty(tool.uischema.options)) {
        delete tool.uischema.options;
    }
}
export const createTypeArraySchemaOnly = (tool: ToolInterface): JsonSchema => {

    let isInlineType;
    let allowInlineType = false;
    if(tool instanceof ArrayTool) {
        isInlineType = tool.isInlineType;
    }

    const hasChilds = tool.childs?.length > 0;
    const hasOneChild = tool.childs?.length === 1;

    if(hasOneChild && isInlineType) {
        allowInlineType = true
    }

    let items = {
        type: 'null',
    } as JsonSchema;

    if (hasChilds) {
        if(allowInlineType) {
            items = tool.childs[0].schema;
        }
        else {
            items = createTypeObjectSchemaOnly(tool);
        }
    }

    return {
       // ...tool.schema,
        type: 'array',
        items: items,
    } as JsonSchema;
};


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

export const createTypeObjectSchemaOnly = (tool: ToolInterface): JsonSchema => {
    const properties = {} as Record<string, JsonSchema>;
    const required = [] as Array<string>;

    tool.childs?.forEach((childTool: ToolInterface) => {
        // if ('object' === childTool?.schema?.type) {
        //     const childSchema = createTypeObjectSchema(childTool);
        //     properties[childTool.propertyName] = childSchema[childTool.propertyName];
        //
        // } else {
        //     properties[childTool.propertyName] = childTool.schema;
        // }

        //probably uischema
        if(_.isEmpty(childTool.schema)) {
            return;
        }

        properties[childTool.propertyName] = generateSchemaByTool(childTool);

        if (childTool.isRequired) {
            required.push(childTool.propertyName);
        }
    });

    return {
        //...tool.schema,
        type: 'object',
        properties: properties,
        required: required.length ? required : undefined,
    } as JsonSchema;
};


export const createTypeObjectSchema = (tool: ToolInterface): Record<string, JsonSchema> => {
    const schemas = {} as Record<string, JsonSchema>;

    if ('object' === tool?.schema?.type) {
        schemas[tool.propertyName] = createTypeObjectSchemaOnly(tool);
    }

    return schemas;
};
export const createCombinatorSchema = (tool: ToolInterface, keyword: string): JsonSchema => {

    let schema = [] as JsonSchema[];

    if(tool.childs?.length) {
        schema = tool.childs?.map((childTool: ToolInterface) => {
            return generateSchemaByTool(childTool);
        });
    }
    else {
        //no empty combinators (otherwise jsonforms throws error)
        /** @ts-ignore */
        const schemas = tool.schema[keyword];
        if(_.isEmpty(schemas)) {
            schema = [{}];
        }

        //also for (@see https://jsonforms.io/docs/multiple-choice/#one-of)
        else {
            return tool.schema;
        }
    }

    return {
        [keyword]: schema,
    };
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
    let set = generateSchemaByTool(tool);

    //console.log("setitem",set);

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
    cleanSchema(tool);

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
            }
        }

        generateSchemaForUiSchema(tool, rootSchema);
    } else {
        created.elements = tool.childs?.map((t: ToolInterface) => {
            return createJsonUiSchema(t, rootSchema)
        }) ?? [];
    }

    return created;
};
