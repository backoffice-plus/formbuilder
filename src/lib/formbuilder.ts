// @ts-ignore
import _ from "lodash";
import type {ToolInterface,} from "./tools/index";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
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
import {jsonForms as toolOptionsSchemaStyles} from "./tools/schema/subschemas/styles";
import {
    jsonForms as toolOptionsSchemaLabelAndI18n,
    uischemaDescriptionOnly,
    uischemaNoDescription
} from "./tools/schema/labelAndI18n";
import {Resolver} from "@stoplight/json-ref-resolver";
import {CombinatorTool} from "./tools/combinatorTool";
import {ArrayTool} from "./tools/ArrayTool";

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
    const defaultData = clone.optionDataPrepare({})
    clone.optionDataUpdate({}, defaultData);

    return clone;
};


export const cloneToolWithSchema = (tool: ToolInterface, schema: JsonSchema, uischema: UISchemaElement|undefined = undefined) => {

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


export const findBaseTool = (schema:JsonSchema, uischema:ControlElement|Layout|UISchemaElement|Scoped) : ToolInterface => {

    if(undefined === schema) {
        throw "schema is undefined"
    }
    if(undefined === uischema || null === uischema) {
        throw "uischema is undefined"
    }

    const isLayout = "elements" in uischema
    const isScoped = "scope" in uischema;

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
                console.error("scope=# is not supported")
                return unknownTool;
                const props = schema.properties as any;
                const propKeys = Object.keys(props);
                itemSchema = propKeys[0] && props[propKeys[0]] as any
            } else {
                itemSchema = _.get(schema, normalizeScope(uischema.scope));
            }
        }

        tool = findMatchingTool(schema, itemSchema, uischema) ?? unknownTool;
    }

    const clone = cloneToolWithSchema(tool, itemSchema, uischema as UISchemaElement);

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
    const schemaMap = {
        'validation.schema': toolOptionsSchemaValidation.schema,
        'validation.uischema': toolOptionsSchemaValidation.uischema,
        'rule.schema': toolOptionsSchemaRule.schema,
        'rule.uischema': toolOptionsSchemaRule.uischema,
        'labelAndI18n.schema': toolOptionsSchemaLabelAndI18n.schema,
        'labelAndI18n.uischema': toolOptionsSchemaLabelAndI18n.uischema,
        'labelAndI18n.descriptionOnly.uischema': uischemaDescriptionOnly,
        'labelAndI18n.noDescription.uischema': uischemaNoDescription,
        'styles.schema': toolOptionsSchemaStyles.schema,
        'styles.uischema': toolOptionsSchemaStyles.uischema,
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



