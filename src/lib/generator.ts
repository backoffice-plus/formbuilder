import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolInterface} from "./models";
import {SchemaTool} from "./tools/SchemaTool";

export const generateSchemaForUiSchema = (tool: ToolInterface, rootSchema: JsonSchema): void => {

    const schema = tool?.schema;

    if ('array' === schema?.type) {
        const firstChild = tool.childs[0];
        const isFirstChildLayout = firstChild && 'Control' !== firstChild.uischema.type; //:TODO add better check!

        if (!isFirstChildLayout) {
            setItemSchemaToSchema(tool, rootSchema);
        }
    }
    // else if ('object' === schema?.type) {
    //     //const schemasToPush = createTypeObjectSchema(tool);
    //     const properties = {
    //         [tool.propertyName]:  generateSchemaByTool(tool),
    //     }
    //     _.merge(rootSchema, {properties: properties, type: 'object'})
    // }
    // else if (undefined !== schema?.allOf || undefined !== schema?.anyOf || undefined !== schema?.oneOf) {
    //     tool.schema = createCombinatorSchema(tool);
    //     setItemSchemaToSchema(tool, rootSchema);
    // }
    else {
        setItemSchemaToSchema(tool, rootSchema);
    }

}

export const cleanSchema = (tool: ToolInterface) => {
    if (_.isEmpty(tool.uischema.options)) {
        delete tool.uischema.options;
    }
}
// //:moved to arrayTool
// export const createTypeArraySchemaOnly = (tool: ToolInterface): JsonSchema => {
//
//     let isInlineType;
//     let allowInlineType = false;
//     // if(tool instanceof ArrayTool) {
//     //     isInlineType = tool.isInlineType;
//     // }
//
//     const hasChilds = tool.childs?.length > 0;
//     const hasOneChild = tool.childs?.length === 1;
//     const parentIsSchema = tool.parentTool instanceof SchemaTool;
//
//     // if(hasOneChild && isInlineType) {
//     //     allowInlineType = true
//     // }
//
//     let items = {
//         type: 'null',
//     } as JsonSchema|JsonSchema[];
//
//
//     if (hasChilds) {
//         const schemas = tool.childs.map((childTool: ToolInterface) => {
//             return childTool.generateJsonSchema();
//         });
//
//         if(parentIsSchema) {
//             items = schemas;
//         }
//         else {
//             //use only the first child (it that correct?!)
//             items = schemas[0];
//         }
//     }
//
//     const addToSchema = {} as any;
//     ['uniqueItems'].forEach((key:string) => {
//         /** @ts-ignore **/
//         if(undefined !== tool.schema[key]) {
//             /** @ts-ignore **/
//             addToSchema[key] = tool.schema[key];
//         }
//     })
//
//     return {
//         ...tool.schema, //must be enabled to get all schema data from tool.optionDataUpdate
//         ...addToSchema,
//         type: 'array',
//         items: items,
//     } as JsonSchema;
// };

//@deprecated
// export const createTypeArraySchema = (tool: ToolInterface): Record<string, JsonSchema> => {
//     const schemas = {} as Record<string, JsonSchema>;
//
//     /** @ts-ignore */
//     if ('object' === tool?.schema?.items?.type) {
//         const properties = {} as Record<string, JsonSchema>;
//         const required = [] as Array<string>;
//
//         tool.childs.forEach((childTool: ToolInterface) => {
//             if ('array' === childTool?.schema?.type) {
//                 const childSchema = createTypeArraySchema(childTool);
//                 properties[childTool.propertyName] = childSchema[childTool.propertyName];
//
//             } else {
//                 properties[childTool.propertyName] = childTool.schema;
//             }
//
//             if (childTool.isRequired) {
//                 required.push(childTool.propertyName);
//             }
//         });
//
//         schemas[tool.propertyName] = {
//             ...tool.schema,
//             type: 'array',
//             items: {
//                 type: "object",
//                 properties: properties,
//                 required: required.length ? required : undefined,
//             }
//         } as JsonSchema;
//
//     } else {
//         schemas[tool.propertyName] = {
//             ...tool.schema,
//             type: 'array',
//             items: tool.childs?.length ? tool.childs[0].schema : {type: 'null'}
//         } as JsonSchema;
//     }
//
//     return schemas;
// };

//:moved to objectTool
// export const createTypeObjectSchemaOnly = (tool: ToolInterface): JsonSchema => {
//     const properties = {} as Record<string, JsonSchema>;
//     const required = [] as Array<string>;
//
//     //const {childs, schemas} = splitChilds(tool.childs);
//
//     tool.childs.forEach((childTool: ToolInterface) => {
//         // if ('object' === childTool?.schema?.type) {
//         //     const childSchema = createTypeObjectSchema(childTool);
//         //     properties[childTool.propertyName] = childSchema[childTool.propertyName];
//         //
//         // } else {
//         //     properties[childTool.propertyName] = childTool.schema;
//         // }
//
//         //probably uischema
//         if(_.isEmpty(childTool.schema)) {
//             return;
//         }
//
//         properties[childTool.propertyName] = childTool.generateJsonSchema();
//
//         if (childTool.isRequired) {
//             required.push(childTool.propertyName);
//         }
//     });
//
//     // const conditionalSchemas = {} as JsonSchema | any;
//     // schemas.forEach((schemaTool: ToolInterface|SchemaTool) => {
//     //     if(schemaTool instanceof  SchemaTool) {
//     //         const schemaToSet = generateSchemaByTool(schemaTool) as any;
//     //         conditionalSchemas[schemaTool.keyword] = schemaToSet[schemaTool.keyword];
//     //     }
//     // });
//
//     //console.log("generator object",tool.schema)
//
//
//     return {
//         ...tool.schema,
//         type: 'object',
//         properties: properties,
//         required: required.length ? required : undefined,
//         //...conditionalSchemas
//     } as JsonSchema;
// };

//@deprecated
// export const createTypeObjectSchema = (tool: ToolInterface): Record<string, JsonSchema> => {
//     const schemas = {} as Record<string, JsonSchema>;
//
//     if ('object' === tool?.schema?.type) {
//         schemas[tool.propertyName] = createTypeObjectSchemaOnly(tool);
//     }
//
//     return schemas;
// };

//@deprecated
// export const createCombinatorSchema = (tool: ToolInterface, keyword: string): JsonSchema => {
//
//     let schema = [] as JsonSchema[];
//
//     if(tool.childs?.length) {
//         schema = tool.childs?.map((childTool: ToolInterface) => {
//             return childTool.generateJsonSchema();
//         });
//     }
//     else {
//         //no empty combinators (otherwise jsonforms throws error)
//         /** @ts-ignore */
//         const schemas = tool.schema[keyword];
//         if(_.isEmpty(schemas)) {
//             schema = [{}];
//         }
//
//         //also for (@see https://jsonforms.io/docs/multiple-choice/#one-of)
//         else {
//             return tool.schema;
//         }
//     }
//
//     return {
//         ...tool.schema,
//         [keyword]: schema,
//     };
// };

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
    cleanSchema(tool);

    const uischema = tool.uischema;

    const created = uischema && "type" in uischema && _.cloneDeep(uischema) as JsonFormsUISchema | any;
    const isScoped = created && "scope" in created;
    //const isLayout = "elements" in created;


    if (isScoped) {
        if ('array' === tool?.schema?.type) {

            const firstChild = tool.childs[0];
            const isFirstChildLayout = firstChild && 'Control' !== firstChild.uischema.type; //:TODO add better check!

            if (isFirstChildLayout) {
                const subSchema = {type: 'object'};
                const detailSchema = createJsonUiSchema(firstChild, subSchema, schemaReadOnly);

                tool.schema['items'] = subSchema;
                !schemaReadOnly && setItemSchemaToSchema(tool, rootSchema);

                created.options['detail'] = detailSchema
            }
        }

        !schemaReadOnly && generateSchemaForUiSchema(tool, rootSchema);
    } else {

        //:INFO some tools dont have elements (LabelTool)
        if(tool.childs.length) {

            //const {childs,schemas} = splitChilds(tool.childs);

            created.elements = tool.childs.map((t: ToolInterface) => {
                    return createJsonUiSchema(t, rootSchema, schemaReadOnly)
                }) ?? [];

            // schemaKeywords.forEach(key => {
            //     key in rootSchema && delete (rootSchema as any)[key]
            // })
            // schemas.forEach((t: ToolInterface)=> {
            //     if(t instanceof SchemaTool) {
            //         const schemaToSet = generateSchemaByTool(t);
            //         (rootSchema as any)[t.keyword] = (schemaToSet as any)[t.keyword];
            //     }
            // });
        }
    }

    return created;
};

// const splitChilds = (tools:ToolInterface[]) : {childs:ToolInterface[], schemas:ToolInterface[]}  => {
//
//     const childs = [] as ToolInterface[];
//     const schemas = [] as ToolInterface[];
//
//     tools.forEach((t: ToolInterface) => {
//         if(t instanceof SchemaTool) {
//             schemas.push(t)
//         }
//         else {
//             childs.push(t)
//         }
//     });
//
//     return {childs, schemas}
// }
