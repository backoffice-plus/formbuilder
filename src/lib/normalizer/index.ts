// @ts-ignore
import _ from "lodash";
import {
    JsonForms,
    Tool,
    ToolProps, updatableSchemaKeys, updatableUischemaKeys
} from "../models";
import type { SchemaBasedCondition} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Rule} from "@jsonforms/core";
import {isOneOfControl, isStringControl, isAnyOfControl, isBooleanControl, isNumberControl, or, rankWith} from "@jsonforms/core";

export const isScope = (scope:string) : boolean => {
    return scope.startsWith('#/properties/')
}
export const isPath = (path:string) : boolean => {
    return path.startsWith('properties.')
}

export const normalizeCombinators = (items:Array<JsonSchema|any>) => {
    return items.map(item => {
        const copy = {...item}
        if(copy.$ref !== undefined) {
            copy._ref = copy.$ref;
            delete copy.$ref;
        }
        return copy;
    })
}
export const denormalizeCombinators = (items:Array<any>) => {
    return items.map(item => {
        if(item._ref !== undefined) {
            item.$ref = item._ref;
            delete item._ref;
        }
        return item;
    })
}


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

/*
    from {address:{properties:{street:{...}}}
    to   [{_key:'address',properties:[{_key:'street'}]]
 */
export const normalizeDefinitions = (schema:JsonSchema) : Array<any> => {

    const r = [] as Array<any>;

    Object.keys(schema).map((key:string) => {
        /* @ts-ignore */
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

    if(options.anyOf !== undefined) {
        options.anyOf = normalizeCombinators(options.anyOf)
    }

    console.log("normalizeModalOptions",tool);


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

export const denormalizeModalOptions = (data:any) : any => {

    //convert enum to map
    if(data?.enum) {
        data.enum = data.enum?.map((item:any)=>String(item?.name ?? '')) ?? [''];
        data.enum = [...new Set(data.enum)];
    }

    if(data.rule) {
        data.rule = denormalizeRule(data.rule);
    }

    if(data.anyOf) {
        data.anyOf = denormalizeCombinators(data.anyOf)
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
    }), rankWith(1, or(isStringControl, isBooleanControl, isNumberControl))),


    new Tool('combinator', ToolProps.create({
        toolType: 'combinator',
        toolName: 'Combinator',
        jsonForms: {schema:{}, uischema:{type:'Control'}}
    }), rankWith(1, isAnyOfControl)),

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
    }), rankWith(1, isOneOfControl)),

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
