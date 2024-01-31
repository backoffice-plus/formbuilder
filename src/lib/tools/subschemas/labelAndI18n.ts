import type {JsonSchema} from "@jsonforms/core";
import type {UISchemaElement} from "@jsonforms/core";
import type {ToolContext} from "../../models";

export const schemaKeys = ['title', 'description'] as Array<'title' | 'description'>;
export const uischemaKeys = ['label', 'i18n'] as Array<'label' | 'i18n'>;

export const prepareOptionData = (context:ToolContext, schema:JsonSchema, uischema:UISchemaElement|any) : Record<string, any> => {
    const data = {
        _type:uischema.type,
        //_isUischema: 'uischema' === context.builder || !context?.builder,
        options: {}
    } as Record<string, any>;

    schemaKeys.forEach(key => data[key] = schema[key]);
    uischemaKeys.forEach(key => data[key] = uischema[key]);

    return {labelAndI18n:data};
}
export const setOptionData = (schema:JsonSchema, uischema:UISchemaElement|any, data:Record<string, any>) : void => {
    schemaKeys.forEach(key => schema[key] = data.labelAndI18n[key]);
    uischemaKeys.forEach(key => uischema[key] = data.labelAndI18n[key]);
}

