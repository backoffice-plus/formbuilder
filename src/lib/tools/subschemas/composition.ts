import type {JsonSchema, UISchemaElement} from "@jsonforms/core";
import * as _ from 'lodash-es';
import {type ToolContext} from "@/";
import {cleanEmptySchema} from "@/lib/tools/SchemaTool";

export const schemaKeys = ['oneOf', 'allOf', 'anyOf'] as const;

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        if (key in schema) {
            data[key] = schema[key]
        }
    });

    return {composition: data};
}

export const setOptionData = (schema: JsonSchema | any, uischema: UISchemaElement, data: Record<string, any>): void => {

    schemaKeys.forEach((key) => {
        schema[key] = cleanEmptySchema(data?.composition?.[key])
        if (undefined === schema[key] || _.isEmpty(schema[key])) {
            delete schema[key];
        }
    });

    delete data.composition
}
