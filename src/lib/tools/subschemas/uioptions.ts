import type {ToolContext, ToolInterface} from "../../models";

export const prepareOptionData = (context: ToolContext, tool: ToolInterface): Record<string, any> => {
    //const uiOptions = tool.uischema?.options;//JSON.parse(JSON.stringify(tool.uischema?.options ?? {}))
    const uiOptions = JSON.parse(JSON.stringify(tool.uischema?.options ?? {}))

    const styles = {...uiOptions?.styles};
    const detail = uiOptions?.detail;
    const options = {...uiOptions, ...{styles:undefined,detail:undefined}};
    delete options.styles;
    delete options.detail;

    // const fl = styles && flatten(styles) as any;
    // const stylesAsArray = fl && Object.keys(fl).map(key => {
    //     return {'path': key, 'class': fl[key]}
    // })

    /**
     * :BUG https://github.com/eclipsesource/jsonforms/issues/1917
     * @see https://jsonforms.io/docs/uischema/controls/#label-for-array-elements-elementlabelprop
     * prefer elementLabelProp over childLabelProp
     */
    if('childLabelProp' in options && options?.childLabelProp) {
        options.elementLabelProp = options.childLabelProp;
    }

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
            stylesAsArray,
            detail
        }
    };
}

export const setOptionData = (context: ToolContext, tool: ToolInterface, data: Record<string, any>): void => {

    //const options = {...data.uiOptions?.options};
    const options = JSON.parse(JSON.stringify(data.uiOptions?.options));
    const styles = data.uiOptions?.styles ?? {};
    const stylesAsArray = data.uiOptions?.stylesAsArray;
    const detail = data.uiOptions?.detail;

    //clean "default" values from toolfinder.uiOptions
    const toolFinder = context?.fb?.exposed?.toolFinder;
    const uiOptions = {
        ...toolFinder?.getUiOptions(tool.uischema?.type),
        ...tool?.availableUiOptions()
    }

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

    if(detail) {
        options.detail = detail;
    }

    tool.uischema.options = options;

    if(false === tool.uischema?.options?.multi) {
        delete tool.uischema.options.multi;
    }
}

