import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core/src/models/uischema";
import type {ToolContext} from "../../models";

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
        schema[key] = data?.conditional[key]
        if (undefined === schema[key]) {
            delete schema[key];
        }
    });
}
