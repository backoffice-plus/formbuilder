import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {ToolContext} from "../../models";
import * as _ from 'lodash-es';
import {cleanEmptySchema} from "../SchemaTool";

export const schemaKeys = ['if', 'else', 'then'] as Array<string>;

export const prepareOptionData = (context: ToolContext, schema: JsonSchema, uischema: UISchemaElement): Record<string, any> => {
    const data = {} as Record<string, any>;

    schemaKeys.forEach(key => {
        /* @ts-ignore */
        if (undefined !== schema[key]) {
            /* @ts-ignore */
            data[key] = schema[key]
        }
    });

    return {conditional: data};
}

export const setOptionData = (schema: JsonSchema | any, uischema: UISchemaElement, data: Record<string, any>): void => {
    schemaKeys.forEach((key) => {
        schema[key] = cleanEmptySchema(data?.conditional[key])
        if (undefined === schema[key] || _.isEmpty(schema[key])) {
            delete schema[key];
        }
    });

    if("conditional" in schema && _.isEmpty(schema.conditional)) {
        delete schema.conditional
    }
    delete data.conditional
}
