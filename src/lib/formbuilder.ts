// @ts-ignore
import * as _ from 'lodash-es';
import {JsonFormsRendererRegistryEntry, RankedTester} from "@jsonforms/core";
import {Resolver} from "@stoplight/json-ref-resolver";
import {fromPropertyToScope} from './normalizer';
import {subschemaMap} from "./tools/subschemas";
import type {ToolInterface, JsonFormsInterface, ToolContext} from "./models";
import type {JsonSchema,  Scoped, UISchemaElement, ControlElement, Layout, Translator} from "@jsonforms/core";
import {schemaResolverMap, SchemaResolverMethod} from "@/lib/schemaResolver";


export const BuilderMode = {
    SCHEMA: 1,  //builder=schema || schemaOnly
    UI: 2,      //builder=uischema && schemaReadOnly
    BOTH: 3,    //builder=uischema
} as const;

/** @deprecated **/
export const updatePropertyNameAndScope = (propertyName: string | undefined, tool: ToolInterface): string => {
    //:INFO disabled bc baseSchemaTool has no propertyName
    // if (!propertyName) {
    //     throw "invalid propertyName";
    // }

    //console.log("updatePropertyNameAndScope",tool.uischema)

    tool.propertyName = propertyName ?? '';
    if(_.isObject(tool.uischema)) {
        (tool.uischema as Scoped).scope = fromPropertyToScope(tool.propertyName)
    }

    return tool.propertyName;
};



/** @deprecated **/
export const getItemsType = (schema:JsonSchema):string|undefined => {
    const items = schema?.items;
    // @ts-ignore
    return items?.type;
}

// export const getChildComponents = (component:any, namePrefix:string|null) => {
//     const childComponents = {} as Record<string, any>;
//
//     console.log("formbuilder.ts","getChildComponents",component)
//
//     const refs = Object.keys(component.$refs)
//         .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
//         .map(key => {
//             let reff = component.$refs[key];
//             if(reff.length) {
//                 reff = reff[0];
//                 if(1 < reff.length) {
//                     throw "there are more then one $refs with key "+ key
//                 }
//             }
//             return reff;
//         });
//
//     refs.map(reff => {
//         if(!reff.tool.uuid)  {
//             throw "no uuid in getChildComponents";
//         }
//
//         childComponents[reff.tool.uuid] = reff
//     })
//
//     return childComponents;
// };


export const createI18nTranslate = (localeCatalogue: Record<string, string>):Translator => {
    // $KEY can be propertyName or i18n
    // const translations = {
    //    '$KEY.label': 'TEXT',
    //    '$KEY.description': 'TEXT',
    //    '$KEY.error.minLength': 'ERROR TEXT',
    // }

    return (id: string, defaultMessage?: string, values?: any) => {
        let params = {};

        if (values?.error) {
            //console.log("translate error", {key, defaultMessage}, context.error);
            params = {...params, ...values.error?.params};
        }

        return (localeCatalogue[id] && _.template(localeCatalogue[id])(params)) ?? defaultMessage;
    };
}

export const findAllProperties = (schema: JsonSchema, rootPath = ""): Record<string, JsonSchema> => {
    let all = {} as Record<string, JsonSchema>

    schema?.properties && Object.keys(schema.properties ?? {}).map(name => {
        const path = (rootPath ? rootPath + '.' : '') + name;
        if (schema.properties && schema?.properties[name]) {
            if ('object' === schema?.properties[name]?.type) {
                all = {...all, ...findAllProperties(schema.properties[name], path)}
            } else {
                all[path] = schema?.properties[name];
            }
        }
    });

    return all;
}

export const findAllScopes = (uischema: ControlElement | Layout | UISchemaElement): Array<string> => {

    const scopes = [] as Array<string>;

    switch (uischema.type) {
        case 'Control':
            if ("scope" in uischema) {
                scopes.push(uischema.scope);
            }
            break;

        default:
            if ("elements" in uischema) {
                uischema.elements.forEach((elm: UISchemaElement) => scopes.push(...findAllScopes(elm)));
            }
            break;
    }

    return scopes;
};

export const findAllScopeTools = (uitool: ToolInterface, tools: ToolInterface[] = []): ToolInterface[] => {

    const schemaTools = uitool.childs.map(childTool => childTool?.uischema?.scope ? [childTool] : findAllScopeTools(childTool, tools))

    return [
        ...tools,
        ..._.flatten(schemaTools)
    ];
};

type Callback = (ref:URI) => JsonSchema|undefined;
export const resolveSchema = async (schema: any, callback:Callback|undefined = undefined, tool?:ToolInterface, context?:ToolContext): Promise<any> => {

    const resolver = new Resolver({
        resolvers: {
            file: {
                async resolve(ref: URI) {
                    const map = {
                        ...subschemaMap,
                        ...schemaResolverMap,
                    } as Record<string, SchemaResolverMethod>

                    const subschema = map[String(ref)];
                    switch (typeof subschema) {
                        case "function": {
                            if(!tool) throw "tool argument is required at resolveSchema()."
                            if(!context) throw "tool argument is required at resolveSchema()."
                            return await subschema(ref, tool, context);
                        }
                        case "object": return subschema;
                        default: return (callback && callback(ref)) ?? {}
                    }
                }
            },
        }
    });

    return resolver.resolve(schema)
        .then(resolved => {
            if (resolved.errors.length) {
                throw resolved.errors.map(error => error.message);
                console.warn("resolveSchema error", resolved.errors.map(error => error.message));
                return {}
            }
            return resolved.result
        })
}

export const createResolvedJsonForms = (schemas:Promise<any>[]) : Promise<JsonFormsInterface> => {
    return Promise.all(schemas)
        .then((values): JsonFormsInterface => {
            return {schema: values[0], uischema: values[1]}
        });
}



export const prepareAndCallOnDropAreaChange = (e:any, tool:ToolInterface, childs:ToolInterface[], onDropAreaChanged:any) => {

    /**
     * :INFO
     * store current childs in event, its necessary because of type=displaced check (that need old childs)
     */
    //add currentTool as parrent
    Object.keys(e).forEach(key => {
        e[key].parentTool = tool;               //as part of the event
        e[key].childs = childs;               //as part of the event

        // if(e[key].element) {
        //     e[key].element.parentTool = tool;       //attach to the current child
        // }
    });

    //add current childs
    //tool.childs = childs;

    //from fb?.exposed?.onDropAreaChanged(e);
    onDropAreaChanged(e);
}


export const findUnscopedTools = (baseSchemaTool:ToolInterface): ToolInterface[] => {
    return baseSchemaTool.edge.childs.filter((child) => {

        /**
         * :TODO go deeper recursivly for objects
         */
        return !child.edge.uiParent
    })
}

export const createEntryByModule = (module:any):JsonFormsRendererRegistryEntry => {
    if(undefined === module?.default) {
        throw "Module must export \"default\"";
    }
    if(undefined === module?.tester) {
        throw "Module must export \"tester\"";
    }
    return createEntry(module?.default, module?.tester)
}
export const createEntry = (renderer:any,tester:RankedTester):JsonFormsRendererRegistryEntry => {
    return { renderer, tester }
}
