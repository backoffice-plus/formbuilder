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

export const isScope = (scope:string) : boolean => {
    return scope.startsWith('#/properties/')
}
export const isPath = (path:string) : boolean => {
    return path.startsWith('properties.')
}

/*
    from {address:{properties:{street:{...}}}
    to   [{_key:'address',properties:[{_key:'street'}]]
 */
export const normalizeDefinitions = (schema:JsonSchema) : Array<any> => {

    const r = [] as Array<any>;

    Object.keys(schema).map((key:string) => {
        const newSchema = {...schema[key]} as any;
        newSchema._key = key;

        if(newSchema.properties) {
            newSchema.properties = normalizeDefinitions(newSchema.properties);
        }

        r.push(newSchema);
    });

    return r;
}

/*
    from [{_key:'address',properties:[{_key:'street'}]]
    to   {address:{properties:{street:{...}}}
 */
export const denormalizeDefinitions = (definition:Array<any>) : JsonSchema => {

    const props = {} as Record<string, JsonSchema>;

    definition.forEach(item => {
        const nItem = {...item};
        const key = nItem._key;
        if(nItem.properties) {
            nItem.properties = denormalizeDefinitions(nItem.properties);
        }
        delete nItem._key;

        props[key] = nItem;
    });

    return props;
}

/**
 * - scope = #/properties/personalData/properties/age
 * - path = properties.personalData.properties.age
*/
export const normalizeScope = (scope:string) : string => {
    return scope.replaceAll('#/', '').replaceAll('/', '.');
}

/**
 * - path = properties.personalData.properties.age
 * - name = personalData.age
 */
export const normalizePath = (scope:string) : string => {
    return scope.replaceAll('properties.', '');
}
/**
 * - prop = personalData.age
 * - path = properties.personalData.properties.age
 */
export const denormalizePath = (prop:string) : string => {
    return 'properties.' + prop.replaceAll('.', '.properties.');
}
/**
 * - path = properties.personalData.properties.age
 * - scope = #/properties/personalData/properties/age
 */
export const denormalizeScope = (path:string) : string => {
    return '#/' + path.replaceAll('.', '/');
}

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

                let tool = findControlTool(itemSchema, itemUischema).clone(itemSchema, itemUischema);

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
        createJsonUiSchema(rootForm, schema)
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



export const  findLayoutTool = (schema:JsonFormsSchema|undefined = undefined, itemUischema: JsonFormsUISchema) : Tool => {
    const tool = [...layoutTools, ...[tools.tab]].find(comp => comp.props.jsonForms.uischema.type === itemUischema.type)

    if(!tool) {
        throw "No tool was found.";
    }

    return tool.clone(schema, itemUischema);
}

export const findControlTool = (itemSchema:any, itemUischema:any) : Tool => {

    const elements = controlTools.map((itemForm, index) => {
        const schema = itemForm.props.jsonForms.schema;
        const uischema = itemForm.props.jsonForms.uischema;

        let score = 0;

        const sameType = schema.type === itemSchema?.type;
        const isString = 'string' === schema.type;
        if(sameType) {
            score++;

            const sameOptions = itemUischema?.options && JSON.stringify(uischema?.options) === JSON.stringify(itemUischema?.options);
            //console.log("options",JSON.stringify(uischema?.options) , JSON.stringify(itemUischema?.options),sameOptions);
            if(sameOptions) {
                score++;
            }

            if(isString) {
                if(schema?.enum !== undefined && itemSchema?.enum !== undefined) {
                    score++;
                }
                if(schema?.oneOf !== undefined && itemSchema?.oneOf !== undefined) {
                    score++;
                }
                if(schema?.format !== undefined && schema?.format === itemSchema?.format) {
                    score++;
                }
            }
        }

        return [index, score];
    });

    const sorted = elements.sort((a, b) => b[1] - a[1]);

    if(!controlTools[sorted[0][0]]) {
        throw "unknown tool";
    }

    return controlTools[sorted[0][0]];//?.clone(itemSchema, itemUischema);
};



export const guessInputType = (jsonForms:JsonForms) => {
    const type = jsonForms?.schema?.type;
    const format = jsonForms.schema?.format;
    const options = jsonForms.uischema?.options;

    const byType = {
        'number': 'number',
        'integer': 'number',
        'boolean': 'checkbox',
    } as Record<string, string>;
    const stringByFormat = {
        'date': 'date',
        'time': 'time',
        'date-time': 'datetime-local',
    } as Record<string, string>;

    let inputType = 'text';
    switch (type) {
        default:
            if(format && stringByFormat[format]) {
                inputType = stringByFormat[format];
            }
            else if(jsonForms?.schema?.enum || jsonForms?.schema?.oneOf) {
                inputType = 'select'
            }
            else if(options) {
                if(options.multi) {
                    inputType = 'textarea'
                }
            }
            break;

        case 'boolean':
        case 'number':
        case 'integer':
            if(type && byType[type]) {
                inputType = byType[type];
            }
    }

    return inputType;
}


export const normalizeModalOptions = (tool:Tool) : Object => {

    const jsonForms = tool.props.jsonForms as any;

    const options = {} as any;

    options.inputType = guessInputType(jsonForms);
    options.propertyName = tool.props.propertyName;

    const schema = jsonForms.schema;
    if(schema.oneOf !== undefined && !schema.oneOf.length) {
        jsonForms.schema.oneOf = [{}]
    }
    if(schema.enum !== undefined && !schema.enum.length) {
        jsonForms.schema.enum = ['']
    }

    updatableSchemaKeys.forEach(key => {
        if(jsonForms.schema[key] !== undefined) {
            options[key] = jsonForms.schema[key];
        }
    });
    updatableUischemaKeys.forEach(key => {
        if(jsonForms.uischema[key] !== undefined) {
            options[key] = jsonForms.uischema[key];
        }
    });



    const ruleData = jsonForms.uischema.rule && normalizeRule(jsonForms.uischema.rule)
    if(ruleData) {
        options.rule = ruleData;
    }

    //convert enum to object
    // if(options?.enum) {
    //     options.enum = options.enum.map((name: any) => {return {name: String(name)} });
    // }
    // if(options?.rule?.condition?.schema) {
    //     options.rule.condition.schema = JSON.stringify(options.rule.condition.schema);
    // }

    //:TODO fix required
    // //workaround to check
    // if(undefined !== schema?.required)  {
    //     if(schema?.required?.includes('true')) {
    //         options.required = true;
    //     }
    // }

    return options;
};

export const normalizeRule = (rule:Rule) : any => {
    const ruleData = JSON.parse(JSON.stringify(rule)); //deepCopy with refs :TOD0 find better solution

    const condition = rule?.condition as SchemaBasedCondition|any;
    if(condition) {
        if(condition.scope) {
            ruleData.condition._scopePropertyName = normalizePath(normalizeScope(condition.scope));
        }

        if(condition.schema) {
            const schema = condition.schema;

            if(undefined !== schema.const) {
                const typeOf = typeof schema.const;
                const allowedTypes = ['string','number','boolean'];
                const constType = allowedTypes.includes(typeOf) ? typeOf : 'string'
                const setter = {
                    string: '_schemaConstAsString',
                    number: '_schemaConstAsNumber',
                    boolean: '_schemaConstAsBoolean',
                } as Record<string, string>;

                ruleData.condition._schema = 'const';
                ruleData.condition._schemaConstType = constType;
                ruleData.condition[setter[constType]] = schema.const;
            }
        }
    }

    return ruleData;
}

export const denormalizeRule = (data:any) : Rule => {
    const condition = {
        //scope: undefined,
        //schema: undefined
    } as any|SchemaBasedCondition;

    if(data?.condition) {

        //scope
        if(data.condition?._scopePropertyName) {
            condition.scope = denormalizeScope(denormalizePath(data?.condition._scopePropertyName))
        }

        //schema
        //:TODO add _schema=enum
        if(data.condition?._schema === 'const') {
            const schemaConsts = {
                string: data.condition?._schemaConstAsString,
                number: data.condition?._schemaConstAsNumber,
                boolean: data.condition?._schemaConstAsBoolean ?? false,
            } as Record<string, any>;

            let setConst = schemaConsts[data.condition?._schemaConstType];
            if(undefined !== setConst) {
                condition.schema = {const:setConst}
            }
        }
    }

    return {
        effect: data.effect,
        condition: condition,
    } as Rule;
}

export const denormalizeModalOptions = (data:any) => {

    //convert enum to map
    if(data?.enum) {
        data.enum = data.enum?.map((item:any)=>String(item?.name ?? '')) ?? [''];
        data.enum = [...new Set(data.enum)];
    }

    if(data.rule) {
        data.rule = denormalizeRule(data.rule);
    }

    return data;
}

export const tools = {
    tab: new Tool('flexArea', ToolProps.create({
        toolType:'tab',
        jsonForms: {uischema: {type: 'Category'}}
    })),
};

export const layoutTools = [

    new Tool('flexArea', ToolProps.create({
        toolType:'flex',
        jsonForms: {uischema: {type: 'VerticalLayout'}},
        toolName: 'Vertical Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'flexRow',
        jsonForms: {uischema: {type: 'HorizontalLayout'}},
        toolName: 'Horizontal Layout',
    })),

    new Tool('flexArea', ToolProps.create({
        toolType:'group',
        jsonForms: {uischema: {type: 'Group'}}
    })),

    new Tool('categorization', ToolProps.create({
      toolType:'tabs',
      jsonForms: {uischema: {type: 'Categorization'}},
    })),

    new Tool('label', ToolProps.create({
        toolType:'label',
        jsonForms: {uischema: {type: 'Label', text:'label'}},
    })),
];

export const controlTools = [

    new Tool('formInputByType', ToolProps.create({
        toolType: 'control',
        toolName: 'Control',
        jsonForms: {schema:{type:'string'}, uischema:{type:'Control'}}
    })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'textarea',
    //     jsonForms: {schema:{type:'string'}, uischema:{type:'Control', options:{multi:true}}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'number',
    //     jsonForms: {schema:{type:'number'}, uischema:{type:'Control'}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'date',
    //     jsonForms: {schema:{type:'string', format: 'date'}, uischema:{type:'Control'}}
    // })),

    //via optionModal.format
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'datetime-local',
    //     jsonForms: {schema:{type:'string', format: 'date-time'}, uischema:{type:'Control'}}
    // })),
    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'time',
    //     jsonForms: {schema:{type:'string', format: 'time'}, uischema:{type:'Control'}}
    // })),

    //no jsonforms renderer
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'radio',
    //     jsonForms: {schema:{type:'string',enum:[]}, uischema:{type:'Control', options:{format:'radio'}}}
    // })),

    new Tool('formInputByType', ToolProps.create({
        toolName: 'select',
        jsonForms: {schema:{type:'string',oneOf:[]}, uischema:{type:'Control'}}
    })),

    // new Tool('formInputByType', ToolProps.create({
    //     toolName: 'checkbox',
    //     jsonForms: {schema:{type:'boolean'}, uischema:{type:'Control'}}
    // })),

    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'file',
    //     jsonForms: {schema:{type:'string', format:'file'}, uischema:{type:'Control'}}
    // })),


    //try to solve with optionmodal
    // new Tool('formInputByType', ToolProps.create({
    //     inputType: 'number',
    //     jsonForms: {schema:{type:'integer'}, uischema:{type:'Control'}}
    // })),

    //no renderer for slider:true
    // new Tool('formInputByType', ToolProps.create({
    //   inputType: 'range',
    //   jsonForms: {schema:{type:'number'}, uischema:{type:'Control',options:{"slider": true }}}
    //   //{type: 'number',"minimum": 1,"maximum": 5, "default": 2}
    // })),
];
