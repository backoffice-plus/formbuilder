import type {ToolContext, ToolInterface} from "../../models";


export const uioptionsSchemaResolver = (uri: URI, tool: ToolInterface, context: ToolContext) => {
    if ('uioptions' === String(uri)) {
        const toolFinder = context?.fb?.exposed?.toolFinder;
        const uiOptions = toolFinder?.getUiOptions(tool.uischema?.type)

        return {
            type: "object",
            properties: uiOptions,
            additionalProperties: {
                type: ["string", "number", "boolean"]
            }
        }
    }
}

export const setOptionData = (context: ToolContext, tool: ToolInterface, data: Record<string, any>): void => {

    const options = data.uischema.options ?? {};

    const toolFinder = context?.fb?.exposed?.toolFinder;
    const uiOptions = toolFinder?.getUiOptions(tool.uischema?.type)
    if (uiOptions) {
        Object.keys(uiOptions).forEach(name => {
            const schema = uiOptions[name];
            if (name in options) {
                const value = options[name];
                if (value === schema?.default) {
                    delete options[name]
                }
            }
        })
    }

    tool.uischema.options = options;
}

