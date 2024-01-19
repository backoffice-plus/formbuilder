import type {GroupLayout, JsonSchema, JsonSchema7, UISchemaElement} from "@jsonforms/core";
import {composePaths, createControlElement, createDefaultValue, deriveTypes, encode, Generate} from "@jsonforms/core";
import startCase from "lodash/startCase";
import isPlainObject from "lodash/isPlainObject";

export type AdditionalPropertyType = {
    propertyName: string
    path: string
    schema?: JsonSchema
    uischema?: UISchemaElement
}


export const createAdditionProperties = (schema: JsonSchema, data: any, path?: string): AdditionalPropertyType[] => {
    const additionalKeys = getAdditionalKeys(data, schema);

    return additionalKeys.map(propName => createAdditionalProperty(propName, data?.[propName], schema, path));
}

export const getAdditionalKeys = (data: any, schema: JsonSchema): string[] => {
    const reservedPropertyNames = getReservedPropertyNames(schema?.properties ?? {});

    return Object.keys(isPlainObject(data) ?? {})
        .filter(k => !reservedPropertyNames.includes(k))
}

export const getReservedPropertyNames = (properties: Record<any, any>): string[] => {
    return Object.keys(properties);
}

export const getPropSchemaByPattern = (propName: string, patternProperties?: Record<string, any>): JsonSchema | undefined => {
    const keys = (typeof patternProperties === 'object' && Object.keys(patternProperties)) ?? [];
    const matchedPattern = Object.keys(keys).find((pattern) => new RegExp(pattern).test(propName));

    return matchedPattern && patternProperties[matchedPattern]
}

export const getPropSchema = (propName: string, propValue: any, schema?: JsonSchema) => {
    let propSchema = getPropSchemaByPattern(propName, schema?.patternProperties)

    if (!propSchema && typeof schema?.additionalProperties === 'object') {
        propSchema = schema.additionalProperties;
    }

    if (!propSchema && propValue !== undefined) {
        // can't find the propertySchema so use the schema based on the value
        // this covers case where the data in invalid according to the schema
        propSchema = Generate.jsonSchema(
            {prop: propValue},
            {
                additionalProperties: false,
                required: () => false,
            }
        ).properties?.prop;
    }

    return propSchema;
}

export const getPropUiSchema = (propName: string, propSchema: JsonSchema, path?: string): UISchemaElement | undefined => {

    let propUiSchema: UISchemaElement | undefined;

    if (['object', 'array'].includes(deriveTypes(propSchema)?.[0])) {
        propUiSchema = Generate.uiSchema(propSchema, 'Group');
        (propUiSchema as GroupLayout).label = propSchema.title ?? startCase(propName);
    } else {
        //FIX
        //propUiSchema = createControlElement(path + '/' + encode(propName)); //NOT WORKING WITH PATH
        propUiSchema = createControlElement(encode(propName));
    }

    return propUiSchema;
}

export const createAdditionalProperty = (propName: string, propValue: any, schema?: JsonSchema, path?: string): AdditionalPropertyType => {

    let propSchema = getPropSchema(propName, propValue, schema)
    let propUiSchema = propSchema && getPropUiSchema(propName, propSchema, path);

    return {
        propertyName: propName,
        path: composePaths(path, propName),
        schema: propSchema,
        uischema: propUiSchema,
    };
}

/**
 * TODO: create issue against jsonforms to add propertyNames into the JsonSchema interface
 * propertyNames exist in draft-6 but not defined in the JsonSchema
 */
export const getPropertyNames = (schema: JsonSchema | any): JsonSchema7 | undefined => {
    const isObject = 'object' === typeof schema?.propertyNames;
    return isObject && schema.propertyNames;
}

export const createPropertyNameSchema = (schema: JsonSchema | any): JsonSchema7 | undefined => {

    let propertyNameSchema = getPropertyNames(schema);

    const isAdditionalPropertiesNotObject = 'object' !== typeof schema?.additionalProperties;
    const hasPatternProperties = 'object' === schema?.patternProperties;

    if (isAdditionalPropertiesNotObject && hasPatternProperties) {
        const matchPatternPropertiesKeys: JsonSchema7 = {
            type: 'string',
            pattern: Object.keys(schema.patternProperties).join('|'),
        };

        propertyNameSchema = propertyNameSchema
            ? {allOf: [propertyNameSchema, matchPatternPropertiesKeys]}
            : matchPatternPropertiesKeys;
    }

    return propertyNameSchema;
}


export const setNewData = (newData: Record<string, any>, additionalPropertyItems: AdditionalPropertyType[]): boolean => {
    let hasChanges = false;

    const keys = Object.keys(newData);

    additionalPropertyItems.forEach((ap: any) => {
        const isNewItem = !keys.includes(ap.propertyName);
        const hasValue = newData[ap.propertyName] === undefined;
        const isNull = newData[ap.propertyName] === null && ap.schema.type !== 'null'  // createDefaultValue will return null only when the ap.schema.type is 'null'

        if (ap.schema && (isNewItem || hasValue || isNull)) {
            const newValue = createDefaultValue(ap.schema);
            hasChanges = newData[ap.propertyName] !== newValue;
            newData[ap.propertyName] = newValue;
        }
    });

    return hasChanges;
}


export const isAdditionalPropertyExists = (additionalProperty: AdditionalPropertyType, schema: JsonSchema, data: any): boolean => {
    const existingPropertyNames = [
        ...getReservedPropertyNames(schema?.properties ?? {}),
        ...Object.keys(data ?? {})
    ]

    return existingPropertyNames.includes(additionalProperty.propertyName);
}
