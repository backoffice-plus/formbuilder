// @ts-ignore
import _ from "lodash";
import type { SchemaBasedCondition} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Rule, UISchemaElement} from "@jsonforms/core";

/**
 * :TODO check @jsonforms\core\src\util\path.ts -> decode() & co

 */
export const isScope = (scope:string) : boolean => {
    return scope.startsWith('#/properties/')
}
export const isPath = (path:string) : boolean => {
    return path.startsWith('properties.')
}

export const normalizeRef = (object:any) => {
    if(object.$ref !== undefined) {
        object._ref = object.$ref;
    }
    return object;
}
export const denormalizeRef = (object:any) => {
    if(object._ref !== undefined) {
        object.$ref = object._ref;
    }
    return object;
}
export const normalizeCombinators = (items:Array<JsonSchema|any>) => {
    return items.map(item => normalizeRef(item));
}
export const denormalizeCombinators = (items:Array<any>) => {
    return items.map(item => denormalizeRef(item));
}


export const guessInputType = (schema:JsonSchema, uischema:UISchemaElement) => {
    const type = schema?.type;
    const format = schema?.format;
    const options = uischema?.options;

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
            else if(schema?.enum || schema?.oneOf) {
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
/**
 * - prop = personalData.age
 * - path = #/properties/personalData/properties/age
 */
export const fromPropertyToScope = (propertyName:string) : string => {
    return denormalizeScope(denormalizePath(propertyName))
}
/**
 -   scope = #/properties/personalData/properties/age
 * - prop = personalData.age
 */
export const fromScopeToProperty = (scope:string) : string => {
    return normalizePath(normalizeScope(scope))
}
/**
 * - prop = personalData.age
 * - path = properties.personalData.properties.age
 */
export const fromPropertyToPath = (propertyName:string) : string => {
    return denormalizePath(propertyName)
}
/**
 * - prop = personalData.age
 * - basePath = properties.personalData
 */
export const fromPropertyToBasePath = (propertyName:string) => {
    return _.toPath(fromPropertyToPath(propertyName)).slice(0,-2).join('.')
}
/**
 * - prop = personalData.age
 * - propPlain = age
 */
export const getPlainProperty = (propertyName:string) : string => {
    return propertyName.split('.').pop() ?? '';
}


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
export const getRequiredPath = (propertyName: string): string => {
    return (fromPropertyToBasePath(propertyName) + '.required').replace(/^\./, '')
}
export const getRequiredFromSchema = (propertyName: string, schema: JsonSchema): Array<string> => {
    return _.get(schema, getRequiredPath(propertyName)) ?? [];
}
/**
 * - prop = data.personal.age
 * - subpaths = ['data', 'data.personal','data.personal.age']
 */
export const getAllSubpaths = (prop: string, startIndex: number = 0) => {
    const allParts: Array<string> = [];

    return _.toPath(prop)
        .map((part: string) => {
            allParts.push(part);
            return allParts.join('.')
        })
        .slice(startIndex);
}
