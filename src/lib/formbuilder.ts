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
import { normalizeScope, normalizePath,denormalizePath,denormalizeScope, fromPropertyToScope} from './normalizer';
import {useTools} from "../composable/tools";
import {unknownTool} from "./tools/unknownTool";
import {unref} from "vue";

export const updatePropertyNameAndScope = (propertyName:string|undefined, tool:ToolInterface) => {
    if (!propertyName) {
        throw "invalid propertyName";
    }
    tool.props.propertyName = propertyName;
    tool.props.jsonForms.uischema.scope = fromPropertyToScope(tool.props.propertyName)
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


export const initElementsByToolProps = (toolProps:ToolProps): Array<any> => {
    //console.log("initElementsByToolProps" , toolProps);

    const jsonFromSchema = toolProps.jsonForms?.schema ?? {};
    const jsonFormUischema = toolProps.jsonForms?.uischema ?? {} as any;

    const pushableElements = [] as any;

    const {findMatchingTool, findLayoutToolByUiType} = useTools();

    jsonFormUischema?.elements?.forEach((itemUischema:any) => {
        switch (itemUischema.type) {
            case 'Control':
                const propertyPath = normalizeScope(itemUischema.scope);
                const itemSchema = _.get(jsonFromSchema, propertyPath);

                let tool = findMatchingTool(jsonFromSchema,itemSchema, itemUischema).clone(itemSchema, itemUischema);

                if(tool) {
                    tool.props.propertyName = normalizePath(propertyPath);

                    pushableElements.push(tool);
                }
                break;

            default:
                const toolLayout = (findLayoutToolByUiType(itemUischema.type) ?? unknownTool).clone(jsonFromSchema, itemUischema)

                if(toolLayout) {
                    pushableElements.push(toolLayout);
                }
                break;
        }
    });

    return pushableElements;
};

export const createJsonForms = (rootForm:any, rootSchema:JsonFormsSchema, schemaReadOnly:boolean) : JsonForms => {

    const schema = _.clone(rootSchema);
    if(!schemaReadOnly) {
        schema.properties = {}; //clear properties
    }

    //console.log("formbuilder.ts","createJsonForms",rootForm)

    return new JsonForms(
        schemaReadOnly ? rootSchema : schema,
        createJsonUiSchema(rootForm, schema)
    );
}

export const setItemSchemaToSchema = (propertyName:string, itemSchema:JsonSchema, rootSchema:JsonFormsSchema) : void => {

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
            setItemSchemaToSchema(propName, schema, rootSchema);
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

