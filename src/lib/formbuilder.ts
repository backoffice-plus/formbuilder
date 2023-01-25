// @ts-ignore
import _ from "lodash";
import {
    JsonForms,
    Tool,
    ToolProps, updatableSchemaKeys, updatableUischemaKeys
} from "./models";
import type {
    JsonFormsSchema,
    JsonFormsUISchema,
} from "./models";
import type {ControlElement, Layout, SchemaBasedCondition} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Rule, UISchemaElement} from "@jsonforms/core";
import {
    isOneOfControl,
    isStringControl,
    isBooleanControl,
    isNumberControl,
    or,and,
    rankWith,
} from "@jsonforms/core";
import { normalizeScope,normalizePath,denormalizePath,denormalizeScope } from './normalizer';
import {isIntegerControl, schemaMatches, schemaTypeIs, uiTypeIs} from "@jsonforms/core/src/testers/testers";
import {findControlToolByTester, findLayoutTool} from "./tools";


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

    jsonFormUischema?.elements?.forEach((itemUischema:any) => {
        switch (itemUischema.type) {
            case 'Control':
                const propertyPath = normalizeScope(itemUischema.scope);
                const itemSchema = _.get(jsonFromSchema, propertyPath);

                let tool = findControlToolByTester(jsonFromSchema,itemSchema, itemUischema).clone(itemSchema, itemUischema);

                if(tool) {
                    tool.props.propertyName = normalizePath(propertyPath);

                    pushableElements.push(tool);
                }
                break;

            default:
                const toolLayout = findLayoutTool(jsonFromSchema, itemUischema);
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

    return new JsonForms(
        schemaReadOnly ? rootSchema : schema,
        createJsonUiSchema(rootForm, schema),
        rootSchema
    );
}

export const createJsonUiSchema = (refElm:any, schema:JsonFormsSchema) : JsonFormsUISchema => {
    refElm = refElm?.value ?? refElm;

    if(!refElm?.tool.props) {
        throw "refElm has no toolProps.";
    }

    const toolProps = refElm?.tool.props as ToolProps;

    const jsonForms = toolProps?.jsonForms.clone();

    const itemSchema = jsonForms.schema as JsonFormsSchema;
    const uischema = jsonForms.uischema as JsonFormsUISchema;

    switch (uischema.type) {
        case 'Control':
            const propName = toolProps?.propertyName ?? "UNKNOWN";

            if(itemSchema.oneOf !== undefined && !itemSchema.oneOf.length) {
                itemSchema.oneOf = [{}];
            }
            if(itemSchema.enum !== undefined && !itemSchema.enum.length) {
                itemSchema.enum = [''];
            }

            const path = denormalizePath(propName);
            uischema.scope = denormalizeScope(path)

            //
            /**
             * check for type=object
             * path = data.personal.age
             * subpaths = ['data', 'data.personal','data.personal.age']
             */
            getAllSubpaths(propName, 1).forEach((subProp:string) => {
                const subPath = denormalizePath(subProp);
                const type = _.get(schema, subPath+'.type')
                if(!type) {
                    _.set(schema, subPath+'.type', 'object')
                }
            })

            _.set(schema, path, itemSchema)

            //:TODO fix required
            // //workaround to receive required info from item
            // if(undefined !== itemSchema?.required)  {
            //     if(itemSchema?.required?.includes('true')) {
            //         if(undefined === schema.required) {
            //             schema.required = [];
             //         }
            //         schema.required?.push(propName);
            //     }
            //     delete itemSchema.required;
            // }
            break;

        case 'VerticalLayout':
        case 'HorizontalLayout':
        case 'Categorization':
        case 'Category':
        case 'Group':
            const childComponents = getChildComponents(refElm, null);

            const elements = refElm.elements.map((tool:Tool) => {
                if(!childComponents[tool.uuid]) {
                    throw "no child with uuid "+ tool.uuid +" found";
                }
                return createJsonUiSchema(childComponents[tool.uuid], schema)
            });
            uischema.elements = elements ?? [];
            // if (props?.label) {
            //     uischema.label = props.label;
            // }
            // if(!uischema.label && 'Category' === uischema.type) {
            //     uischema.label = 'Tab';
            // }
            break;


        // case 'Label':
        //     let label = 'Label';
        //     if(uischema?.label) {
        //         label = String(uischema.label);
        //         delete uischema.label;
        //     }
        //     uischema.text = label;
        //     break;
    }

    return uischema;
};

export const getChildComponents = (component:any, namePrefix:string|null) => {
    const childComponents = {} as Record<string, any>;

    const refs = Object.keys(component.$refs)
        .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
        .map(key => {
            let reff = component.$refs[key];
            if(reff.length) {
                reff = reff[0];
                if(1 < reff.length) {
                    throw "there are more then one $refs with key "+ key
                }
            }
            return reff;
        });

    refs.map(reff => {
        if(!reff.tool.uuid)  {
            throw "no uuid in getChildComponents";
        }

        childComponents[reff.tool.uuid] = reff
    })

    return childComponents;
};


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

