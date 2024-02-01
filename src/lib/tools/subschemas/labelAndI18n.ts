import type {ToolContext, ToolInterface} from "@/lib";

export const schemaKeys = ['title', 'description'] as const;
export const uischemaKeys = ['label', 'i18n'] as const;

export const prepareOptionData = (context:ToolContext, tool:ToolInterface) : Record<string, any> => {
    const data = {
        _type:tool.uischema.type,
        //_isUischema: 'uischema' === context.builder || !context?.builder,
        options: {}
    } as Record<string, any>;

    if(context.isBuilderMode?.schema) {
        schemaKeys.forEach(key => data[key] = tool.schema[key]);
    }
    if(context.isBuilderMode?.uischema) {
        uischemaKeys.forEach(key => data[key] = tool.uischema[key]);
    }

    return {labelAndI18n:data};
}
export const setOptionData = (context:ToolContext, tool:ToolInterface, data:Record<string, any>) : void => {
    if(context.isBuilderMode?.schema) {
        schemaKeys.forEach(key => tool.schema[key] = data.labelAndI18n[key]);
    }
    if(context.isBuilderMode?.uischema) {
        uischemaKeys.forEach(key => tool.uischema[key] = data.labelAndI18n[key]);
    }
}

