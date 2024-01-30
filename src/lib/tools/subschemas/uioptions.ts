import type {ToolContext, ToolInterface} from "../../models";


export const uioptionsSchemaResolver = (uri: URI, tool: ToolInterface, context: ToolContext) => {
    if(!tool) {
        throw "tool argument is missing at uioptionsSchemaResolver(). "
    }
    if ('uioptions' === String(uri)) {
        const toolFinder = context?.fb?.exposed?.toolFinder;
        const uiOptions = {
            ...tool.availableUiOptions(),
            ...toolFinder?.getUiOptions(tool.uischema?.type)          ,
        }

        return {
            type: "object",
            properties: uiOptions,
            additionalProperties: {
                type: ["string", "number", "boolean"]
            }
        }
    }
}

export const prepareOptionData = (context: ToolContext, tool: ToolInterface): Record<string, any> => {
    //const uiOptions = tool.uischema?.options;//JSON.parse(JSON.stringify(tool.uischema?.options ?? {}))
    const uiOptions = JSON.parse(JSON.stringify(tool.uischema?.options ?? {}))

    const styles = {...uiOptions?.styles};
    const options = {...uiOptions, ...{styles:undefined}};
    delete options.styles;

    // const fl = styles && flatten(styles) as any;
    // const stylesAsArray = fl && Object.keys(fl).map(key => {
    //     return {'path': key, 'class': fl[key]}
    // })

    const stylesAsArray:any[] = [];
    Object.keys(styles).forEach(name => {
        Object.keys(styles[name]).forEach(path => {
            stylesAsArray.push({
                name,path,class:styles[name][path]
            })
        })
    })

    return {
        uiOptions: {
            options,
            styles,
            stylesAsArray
        }
    };
}

export const setOptionData = (context: ToolContext, tool: ToolInterface, data: Record<string, any>): void => {

    //const options = {...data.uiOptions?.options};
    const options = JSON.parse(JSON.stringify(data.uiOptions?.options));
    const styles = data.uiOptions?.styles ?? {};
    const stylesAsArray = data.uiOptions?.stylesAsArray;

    //clean "default" values from toolfinder.uiOptions
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


    //unflat stylesAsArray
    // if (stylesAsArray?.length) {
    //     const fl = {} as any;
    //     stylesAsArray.forEach((item: any) => {
    //         fl[item.path] = item.class;
    //     })
    //     options.styles = fl ? unflatten(fl) : undefined;
    // }

    //stylesAsObject
    //options.styles = styles

    if (stylesAsArray?.length) {
        const st:any = {}
        stylesAsArray.forEach((item: any) => {
            if(!(item.name in st)) {
                st[item.name] = {}
            }
            st[item.name][item.path] = item.class;
        })
        options.styles = st;
    }

    tool.uischema.options = options;

    if(false === tool.uischema?.options?.multi) {
        delete tool.uischema.options.multi;
    }
}

