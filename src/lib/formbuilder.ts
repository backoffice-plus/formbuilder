// @ts-ignore
import _ from "lodash";
import type {ToolInterface,} from "./tools/index";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {
    fromPropertyToScope,
    fromScopeToProperty,
    getPlainProperty,
    getRequiredFromSchema,
    normalizePath,
    normalizeScope
} from './normalizer';
import {useTools} from "../composable/tools";
import {unknownTool} from "./tools/unknownTool";
import {jsonForms as toolOptionsSchemaValidation} from "./tools/schema/validation";
import {jsonForms as toolOptionsSchemaRule} from "./tools/schema/rule";
import {jsonForms as toolOptionsSchemaLabelAndI18n} from "./tools/schema/labelAndI18n";
import {Resolver} from "@stoplight/json-ref-resolver";
import {CombinatorTool} from "./tools/combinatorTool";

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
    clone.propertyName = (tool.uischema.type + ++cloneCounter).toLowerCase();

    if(schema) {
        _.merge(clone.schema, {...schema})
    }

    //set default data
    const defaultData = clone.optionDataPrepare(clone)
    clone.optionDataUpdate(clone, defaultData);

    return clone;
};


export const cloneToolWithSchema = (tool: ToolInterface, schema: JsonSchema, uischema: UISchemaElement) => {

    //clone
    const clone = tool.clone();
    _.merge(clone.schema, {...schema})
    _.merge(clone.uischema, {...uischema})

    if ('scope' in clone.uischema) {
        clone.propertyName = fromScopeToProperty(clone.uischema.scope)
    }

    //set default data (sets init data if schema hasnt)
    const defaultData = clone.optionDataPrepare(clone)
    clone.optionDataUpdate(clone, defaultData);

    return clone;
};

export const initArrayElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    const isItemsObject = 'object' === typeof tool.schema?.items;
    const isItemsTypeObject = 'object' === getItemsType(tool.schema);
    /** @ts-ignore */
    const properties = tool.schema?.items?.properties;

    /**
     * Array of Object
     *   items: {  type: 'object', properties: { ... } }*
     */
    if(isItemsTypeObject) {
        properties && Object.keys(properties).forEach((propertyName:string) => {
            const itemSchema = properties[propertyName];

            const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
            const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
            clone.propertyName = propertyName;

            //required
            const required = getRequiredFromSchema(clone.propertyName, tool.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }

            //console.info("initArrayElements", 'push Array of Object', clone.propertyName)
            tools.push(clone);
        });
    }
    /**
     * Array of Schema
     *   items: {  type: 'string' }
     *   items: {  $ref: '#/...' }
     *   items: {  oneOf: [...] }
     */
    else {

        const uischema = {type:'Control',scope:'#/properties/unnamed'} as UISchemaElement;
        /** @ts-ignore */
        const clone = cloneToolWithSchema(findMatchingTool({}, tool.schema?.items, uischema), tool.schema?.items, uischema)
        tools.push(clone);
    }



    return tools;
};

export const initCombinatorElements = (tool: ToolInterface): Array<ToolInterface> => {
    const ctools = [] as any;

    /** @ts-ignore */
    const schemaOfKeyword = CombinatorTool.getKeywordSchemas(tool.schema)

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    schemaOfKeyword && schemaOfKeyword.forEach((itemSchema:JsonSchema) => {

        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)

        // //required
        // const required = getRequiredFromSchema(clone.propertyName, tool.schema);
        // if (required?.includes(getPlainProperty(clone.propertyName))) {
        //     clone.isRequired = true;
        // }

        //console.info("initArrayElements", 'push Array of Object', clone.propertyName)
        ctools.push(clone);
    });

    return ctools;
};

export const initObjectElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as Array<ToolInterface>;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    const properties = tool.schema?.properties;
    properties && Object.keys(properties).forEach((propertyName:string) => {
        const itemSchema = properties[propertyName];
        const uischema = {type:'Control',scope:'#'} as UISchemaElement;
        //const clone = cloneToolWithSchema(schemaTool, itemSchema, {});
        const clone = cloneToolWithSchema(findMatchingTool({}, itemSchema, uischema), itemSchema, uischema)
        clone.propertyName = propertyName;

        //required :TODO
        // const required = getRequiredFromSchema(clone.propertyName, tool.schema);
        // if (required?.includes(getPlainProperty(clone.propertyName))) {
        //     clone.isRequired = true;
        // }

        tools.push(clone);
    });

    return tools;
};

export const findBaseTool = (schema:JsonSchema, uischema:ControlElement|Layout) : ToolInterface => {

    if(undefined === schema) {
        throw "schema is undefined"
    }
    if(undefined === uischema) {
        throw "uischema is undefined"
    }

    const isLayout = "elements" in uischema
    const isScoped = "uischema" in uischema;

    const {findLayoutToolByUiType, findMatchingTool} = useTools();

    let itemSchema = schema;
    let tool;

    if(isLayout) {
        tool = findLayoutToolByUiType(uischema.type) ?? unknownTool;
    }

    //specialcase - some examples use none-Layout-elements as root
    else {
        if(isScoped) {

            //not working well!!!
            if ('#' === uischema?.scope) {
                const props = schema.properties as any;
                const propKeys = Object.keys(props);
                itemSchema = propKeys[0] && props[propKeys[0]] as any
            } else {
                itemSchema = _.get(schema, normalizeScope(uischema.scope));
            }
        }

        tool = findMatchingTool(schema, itemSchema, uischema) ?? unknownTool;
    }

    const clone = cloneToolWithSchema(tool, itemSchema, uischema);

    return clone;
};

export const initElements = (tool: ToolInterface): Array<ToolInterface> => {
    const tools = [] as any;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    tool.uischema?.elements?.forEach((itemUischema: any) => {
        let clone;

        //const isLayout = undefined !== itemUischema.elements
        const isScoped = itemUischema.scope;

        if(isScoped) {
            const propertyPath = normalizeScope(itemUischema.scope);
            const itemSchema = _.get(tool.schema, propertyPath);

            clone = cloneToolWithSchema(findMatchingTool(tool.schema, itemSchema, itemUischema), itemSchema, itemUischema)
            clone.propertyName = normalizePath(propertyPath);

            //required
            const required = getRequiredFromSchema(clone.propertyName, tool.schema);
            if (required?.includes(getPlainProperty(clone.propertyName))) {
                clone.isRequired = true;
            }
        }
        else {
            clone = cloneToolWithSchema(findLayoutToolByUiType(itemUischema.type) ?? unknownTool, tool.schema, itemUischema);
        }

        tools.push(clone);
    });

    return tools;
};

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
    const schemaMap = {
        'validation.schema': toolOptionsSchemaValidation.schema,
        'validation.uischema': toolOptionsSchemaValidation.uischema,
        'rule.schema': toolOptionsSchemaRule.schema,
        'rule.uischema': toolOptionsSchemaRule.uischema,
        'labelAndI18n.schema': toolOptionsSchemaLabelAndI18n.schema,
        'labelAndI18n.uischema': toolOptionsSchemaLabelAndI18n.uischema,
    } as Record<string, any>

    const resolver = new Resolver({
        resolvers: {
            file: {
                async resolve(ref: URI) {
                    return schemaMap[String(ref)] ?? (callback && callback(ref)) ?? {}
                }
            },
        }
    });

    return await resolver.resolve(schema)
        .then(resolved => {
            if (resolved.errors.length) {
                throw resolved.errors.map(error => error.message);
            }
            return resolved.result
        })
}



