import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {JsonFormsInterface} from "../../models";
import type {ToolContext} from "../../models";
import _ from "lodash";

export const schemaKeysString = ['minLength', 'maxLength', 'pattern'] as Array<string>;
export const schemaKeysNumber = ['minimum', 'maximum', 'multipleOf', 'exclusiveMinimum', 'exclusiveMaximum'] as Array<string>;
export const schemaKeysArray = ['minItems', 'maxItems', 'uniqueItems'] as Array<string>;
export const schemaKeysObject = ['minProperties', 'maxProperties',  'dependentRequired', 'propertyNames', 'patternProperties'] as Array<string>;
export const schemaKeys = [...schemaKeysString, ...schemaKeysNumber, ...schemaKeysArray, ...schemaKeysObject, 'not'] as Array<string>;

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        /* @ts-ignore */
        if (undefined !== schema[key]) {
            /* @ts-ignore */
            data[key] = schema[key]
        }
    });

    return {validation: data};
}

export const setOptionData = (schema: JsonSchema|any, uischema: UISchemaElement, data: Record<string, any>): void => {
    schemaKeys.forEach((key) => {
        schema[key] = data?.validation[key]
        if(undefined === schema[key]) {
            delete schema[key];
        }
    });

    if("validation" in schema && _.isEmpty(schema.validation)) {
        delete schema.validation
    }
    delete data.validation
}
