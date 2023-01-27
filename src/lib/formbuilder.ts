// @ts-ignore
import _ from "lodash";
import {
    JsonForms,
    Tool,
    ToolProps
} from "./models";
import type {
    JsonFormsSchema,
    JsonFormsUISchema,
    ToolInterface,
} from "./models";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import {
    normalizeScope,
    normalizePath,
    denormalizePath,
    denormalizeScope,
    fromPropertyToScope,
    getPlainProperty, fromPropertyToBasePath, guessInputType, fromScopeToProperty
} from './normalizer';
import {useTools} from "../composable/tools";
import {unknownTool} from "./tools/unknownTool";
import {unref} from "vue";
import {jsonForms as toolOptionsSchemaValidation} from "../schema/toolOptionsSchemaValidation";
import {jsonForms as toolOptionsSchemaRule} from "../schema/toolOptionsSchemaRule";
import {Resolver} from "@stoplight/json-ref-resolver";

export const updatePropertyNameAndScope = (propertyName:string|undefined, tool:ToolInterface) : string => {
    if (!propertyName) {
        throw "invalid propertyName";
    }
    tool.props.propertyName = propertyName;
    tool.props.jsonForms.uischema.scope = fromPropertyToScope(tool.props.propertyName)

    return propertyName;
};

/**
 * - prop = data.personal.age
 * - subpaths = ['data', 'data.personal','data.personal.age']
*/
export const getAllSubpaths = (prop:string, startIndex:number=0) => {
    const allParts:Array<string> = [];

    return _.toPath(prop)
        .map((part:string) => {
            allParts.push(part);
            return allParts.join('.')
        })
        .slice(startIndex);
}

let cloneCounter=0;
export const cloneTool = (tool:ToolInterface, schema:JsonFormsSchema|undefined, uischema:JsonFormsUISchema|undefined) => {
    const clone = tool.clone(schema, uischema);

    if('Control' === clone.props.jsonForms.uischema.type) {
        if(uischema?.scope) {
            clone.props.propertyName = fromScopeToProperty(uischema.scope)
        }
        if(undefined === clone.props.propertyName) {
            clone.props.propertyName = (tool.props.jsonForms.uischema.type + ++cloneCounter).toLowerCase();
        }
    }

    //set default data
    const defaultData = clone.optionDataPrepare(clone)
    clone.optionDataUpdate(clone, defaultData);

    return clone;
};

export const initElementsByToolProps = (toolProps:ToolProps): Array<any> => {
    //console.log("initElementsByToolProps" , toolProps);

    const jsonFromSchema = toolProps.jsonForms?.schema ?? {};
    const jsonFormUischema = toolProps.jsonForms?.uischema ?? {} as any;

    const pushableElements = [] as any;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    jsonFormUischema?.elements?.forEach((itemUischema:any) => {
        let tool;
        switch (itemUischema.type) {
            case 'Control':
                const propertyPath = normalizeScope(itemUischema.scope);
                const itemSchema = _.get(jsonFromSchema, propertyPath);

                tool = cloneTool(findMatchingTool(jsonFromSchema,itemSchema, itemUischema), itemSchema, itemUischema)
                tool.props.propertyName = normalizePath(propertyPath);

                //required
                const required = getRequiredFromSchema(tool.props.propertyName, jsonFromSchema);
                if(required?.includes(getPlainProperty(tool.props.propertyName))) {
                    tool.isRequired = true;
                }
                break;

            default:
                tool = cloneTool(findLayoutToolByUiType(itemUischema.type) ?? unknownTool, jsonFromSchema, itemUischema);
                break;
        }

        pushableElements.push(tool);
    });

    return pushableElements;
};

export const createJsonForms = (rootForm:any, rootSchema:JsonFormsSchema, schemaReadOnly:boolean) : JsonForms => {

    const schema = _.clone(rootSchema);
    if(!schemaReadOnly) {
        schema.properties = {}; //clear properties
        schema.required = undefined;
    }

    //console.log("formbuilder.ts","createJsonForms",rootForm)

    return new JsonForms(
        schemaReadOnly ? rootSchema : schema,
        createJsonUiSchema(rootForm, schema)
    );
}

export const setItemSchemaToSchema = (tool:ToolInterface, propertyName:string, itemSchema:JsonSchema, rootSchema:JsonFormsSchema) : void => {

    //create type=object in subpaths
    getAllSubpaths(propertyName, 1)
        .forEach((subProp:string) => {
            const subPath = denormalizePath(subProp)+'.type'
            if(!_.get(rootSchema, subPath)) {
                _.set(rootSchema, subPath, 'object')
            }
        }
    )

    _.set(rootSchema, denormalizePath(propertyName), itemSchema)

    if(tool.isRequired) {
        setRequiredToSchema(propertyName, rootSchema, true);
    }
}

export const getRequiredPath = (propertyName:string) : string =>  {
    return (fromPropertyToBasePath(propertyName)+'.required').replace(/^\./,'')
}
export const getRequiredFromSchema = (propertyName:string, schema:JsonSchema) : Array<string> =>  {
    return _.get(schema, getRequiredPath(propertyName)) ?? [];
}
export const setRequiredToSchema = (propertyName:string, schema:JsonSchema, isRequired:boolean=false) : void =>  {
    const plainProp = getPlainProperty(propertyName);
    let required = getRequiredFromSchema(propertyName, schema);
    if(isRequired) {
        if(!required.includes(plainProp)) {
            required.push(plainProp);
        }
    }
    else {
        if(required.includes(plainProp)) {
            required = required.filter((item:string) => item !== plainProp)
        }
    }
    _.set(schema, getRequiredPath(propertyName), required.length ? required : undefined)
}

export const createJsonUiSchema = (refElm:any, rootSchema:JsonFormsSchema) : JsonFormsUISchema => {
    refElm = unref(refElm)

    //from defineExpose() in tool components
    const tool = refElm?.tool as Tool;
    const childTools = refElm?.childTools;
    const childComponents = refElm?.childComponents;

    const propName = tool.props?.propertyName ?? "UNKNOWN";
    const schema = tool.props.jsonForms.schema;
    const uischema = tool.props.jsonForms.uischema;

    const created = _.cloneDeep(uischema) as JsonFormsUISchema;

    switch (uischema.type) {
        case 'Control':
            setItemSchemaToSchema(tool, propName, schema, rootSchema);
            break;

        case 'VerticalLayout':
        case 'HorizontalLayout':
        case 'Categorization':
        case 'Category':
        case 'Group':
            created.elements = childTools.map((tool:Tool) => {
                if(!childComponents[tool.uuid]) {
                    throw "no child with uuid "+ tool.uuid +" found";
                }
                return createJsonUiSchema(childComponents[tool.uuid], rootSchema)
            }) ?? [];
            break;
    }

    return created;
};

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


export const createI18nTranslate = (localeCatalogue:Record<string, string>) => {
    // $KEY can be propertyName or i18n
    // const translations = {
    //    '$KEY.label': 'TEXT',
    //    '$KEY.description': 'TEXT',
    //    '$KEY.error.minLength': 'ERROR TEXT',
    // }

    return  (key:string, defaultMessage:string, context:any) => {
        //console.log("translate", {key,defaultMessage, context}, localeCatalogue[key]);

        let params = {};

        if(context?.error) {
            //console.log("translate error", {key, defaultMessage}, context.error);
            params = {...params, ...context.error?.params};
        }

        return (localeCatalogue[key] && _.template(localeCatalogue[key])(params)) ?? defaultMessage;
    };
}

export const findAllProperties = (schema: JsonFormsSchema, rootPath = "") : Record<string, JsonFormsSchema> => {
    let all = {} as Record<string, JsonFormsSchema>

    schema?.properties && Object.keys(schema.properties ?? {}).map(name => {
        const path = (rootPath ? rootPath+'.' : '') + name;
        if(schema.properties && schema?.properties[name]) {
            if('object' === schema?.properties[name]?.type) {
                all = {...all,...findAllProperties(schema.properties[name], path)}
            }
            else {
                all[path] = schema?.properties[name];
            }
        }
    });

    return all;
}


export const findAllScopes = (uischema:ControlElement|Layout|UISchemaElement) : Array<string> => {

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

export const resolveSchema = async (schema:any) => {
    const schemaMap = {
        'toolOptionsSchemaValidation.schema': toolOptionsSchemaValidation.schema,
        'toolOptionsSchemaValidation.uischema': toolOptionsSchemaValidation.uischema,
        'toolOptionsSchemaRule.schema': toolOptionsSchemaRule.schema,
        'toolOptionsSchemaRule.uischema': toolOptionsSchemaRule.uischema,
    } as Record<string, any>

    const resolver = new Resolver({
        resolvers: {
            file: {
                async resolve(ref:URI) {
                    return schemaMap[String(ref)] ?? {}
                }
            },
        }
    });

    return await resolver.resolve(schema).then(resolved => resolved.result)
}
