// @ts-ignore
import _ from "lodash";
import {Resolver} from "@stoplight/json-ref-resolver";
import type {ToolInterface} from "./tools";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
import {generateJsonSchema, generateDefaultUISchema} from "@jsonforms/core";
import {fromPropertyToScope, fromScopeToProperty, normalizeScope} from './normalizer';
import {unknownTool} from "./tools/unknownTool";
import {subschemaMap} from "./tools/subschemas";
import {objectTool} from "./tools/ObjectTool";
import type {ToolFinder} from "./ToolFinder";

export const   createBaseTool = (toolFinder:ToolFinder, schema: JsonSchema, uischema: UISchemaElement):ToolInterface => {
    if (undefined === schema) {
        schema = generateJsonSchema({});
    }
    if (undefined === uischema) {
        uischema = generateDefaultUISchema(schema);
    }

    return toolFinder.findBaseTool(schema, uischema);
};

export const createSchemaTool = (schema: JsonSchema): ToolInterface => {
    const tool = cloneToolWithSchema(objectTool, schema);
    tool.propertyName = 'schema';

    return tool;
}
export const createDefTool = (schema: JsonSchema): ToolInterface => {
    const defSchema = {
        type:'object',
        properties: schema.definitions
    } as JsonSchema;

    const tool = cloneToolWithSchema(objectTool, defSchema);
    tool.propertyName = 'definitions';

    return tool;
}

export const updatePropertyNameAndScope = (propertyName: string | undefined, tool: ToolInterface): string => {
    if (!propertyName) {
        throw "invalid propertyName";
    }
    tool.propertyName = propertyName;
    tool.uischema.scope = fromPropertyToScope(tool.propertyName)

    return propertyName;
};

let cloneCounter = 0;
export const cloneEmptyTool = (tool: ToolInterface, schema:JsonSchema|undefined = undefined) => {

    const clone = tool.clone();
    if(tool.uischema.type) {
        clone.propertyName = (tool.uischema.type + ++cloneCounter).toLowerCase();
    }

    if(schema) {
        _.merge(clone.schema, {...schema})
    }

    //set default data
    const defaultData = clone.optionDataPrepare({})
    clone.optionDataUpdate({}, defaultData);

    return clone;
};


export const cloneToolWithSchema = (tool: ToolInterface, schema: JsonSchema, uischema: UISchemaElement|undefined = undefined) : ToolInterface => {

    //clone
    const clone = tool.clone();
    _.merge(clone.schema, {...schema})
    if(uischema) {
        _.merge(clone.uischema, {...uischema})
    }

    if ('scope' in clone.uischema) {
        clone.propertyName = fromScopeToProperty(clone.uischema.scope)
    }

    //set default data (sets init data if schema hasnt)
    const defaultData = clone.optionDataPrepare({})
    clone.optionDataUpdate({}, defaultData);

    return clone;
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


export const createI18nTranslate = (localeCatalogue: Record<string, string>) => {
    // $KEY can be propertyName or i18n
    // const translations = {
    //    '$KEY.label': 'TEXT',
    //    '$KEY.description': 'TEXT',
    //    '$KEY.error.minLength': 'ERROR TEXT',
    // }

    return (key: string, defaultMessage: string, context: any) => {
        //console.log("translate", {key,defaultMessage, context}, localeCatalogue[key]);

        let params = {};

        if (context?.error) {
            //console.log("translate error", {key, defaultMessage}, context.error);
            params = {...params, ...context.error?.params};
        }

        return (localeCatalogue[key] && _.template(localeCatalogue[key])(params)) ?? defaultMessage;
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

type Callback = (ref:URI) => JsonSchema|undefined;
export const resolveSchema = async (schema: any, callback:Callback|undefined = undefined): Promise<any> => {

    const resolver = new Resolver({
        resolvers: {
            file: {
                async resolve(ref: URI) {
                    return subschemaMap[String(ref)] ?? (callback && callback(ref)) ?? {}
                }
            },
        }
    });

    return await resolver.resolve(schema)
        .then(resolved => {
            if (resolved.errors.length) {
                throw resolved.errors.map(error => error.message);
                console.log("resolveSchema error", resolved.errors.map(error => error.message));
                return {}
            }
            return resolved.result
        })
}

export const deleteToolInChilds = async (toolToDelete:ToolInterface, childTools:ToolInterface[]) : Promise<ToolInterface[]> => {

    const confirmed = window?.confirm ? window.confirm("Wirklich löschen?") : true;

    return await Promise.resolve(confirmed)
        .then((confirmed) => {
            if(confirmed) {
                childTools = childTools.filter(childTool => childTool.uuid !== toolToDelete.uuid)
            }

            return childTools;
        });
};

