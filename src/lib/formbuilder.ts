// @ts-ignore
import _ from "lodash";
import {Resolver} from "@stoplight/json-ref-resolver";
import type {ToolInterface} from "./models";
import type {ControlElement, Layout} from "@jsonforms/core/src/models/uischema";
import type {JsonSchema, Scoped, UISchemaElement} from "@jsonforms/core";
import {fromPropertyToScope, fromScopeToProperty, normalizeScope} from './normalizer';
import {subschemaMap} from "./tools/subschemas";
import {useModal, useModalSlot, VueFinalModal} from "vue-final-modal";
import ConfirmDelete from "../components/modals/ConfirmDelete.vue";


/** @deprecated **/
export const updatePropertyNameAndScope = (propertyName: string | undefined, tool: ToolInterface): string => {
    //:INFO disabled bc baseSchemaTool has no propertyName
    // if (!propertyName) {
    //     throw "invalid propertyName";
    // }

    //console.log("updatePropertyNameAndScope",tool.uischema)

    tool.propertyName = propertyName ?? '';
    if(_.isObject(tool.uischema)) {
        (tool.uischema as Scoped).scope = fromPropertyToScope(tool.propertyName)
    }

    return tool.propertyName;
};



/** @deprecated **/
export const getItemsType = (schema:JsonSchema):string|undefined => {
    const items = schema?.items;
    // @ts-ignore
    return items?.type;
}

// export const getChildComponents = (component:any, namePrefix:string|null) => {
//     const childComponents = {} as Record<string, any>;
//
//     console.log("formbuilder.ts","getChildComponents",component)
//
//     const refs = Object.keys(component.$refs)
//         .filter(key => key.includes(namePrefix ?? 'components') && component.$refs[key])
//         .map(key => {
//             let reff = component.$refs[key];
//             if(reff.length) {
//                 reff = reff[0];
//                 if(1 < reff.length) {
//                     throw "there are more then one $refs with key "+ key
//                 }
//             }
//             return reff;
//         });
//
//     refs.map(reff => {
//         if(!reff.tool.uuid)  {
//             throw "no uuid in getChildComponents";
//         }
//
//         childComponents[reff.tool.uuid] = reff
//     })
//
//     return childComponents;
// };


export const createI18nTranslate = (localeCatalogue: Record<string, string>) => {
    // $KEY can be propertyName or i18n
    // const translations = {
    //    '$KEY.label': 'TEXT',
    //    '$KEY.description': 'TEXT',
    //    '$KEY.error.minLength': 'ERROR TEXT',
    // }

    return (key: string, defaultMessage: string, context: any) => {
        //console.log("translate", {key,defaultMessage, context}, localeCatalogue[key]);

        let params = {};

        if (context?.error) {
            //console.log("translate error", {key, defaultMessage}, context.error);
            params = {...params, ...context.error?.params};
        }

        return (localeCatalogue[key] && _.template(localeCatalogue[key])(params)) ?? defaultMessage;
    };
}

export const findAllProperties = (schema: JsonSchema, rootPath = ""): Record<string, JsonSchema> => {
    let all = {} as Record<string, JsonSchema>

    schema?.properties && Object.keys(schema.properties ?? {}).map(name => {
        const path = (rootPath ? rootPath + '.' : '') + name;
        if (schema.properties && schema?.properties[name]) {
            if ('object' === schema?.properties[name]?.type) {
                all = {...all, ...findAllProperties(schema.properties[name], path)}
            } else {
                all[path] = schema?.properties[name];
            }
        }
    });

    return all;
}

export const findAllScopes = (uischema: ControlElement | Layout | UISchemaElement): Array<string> => {

    const scopes = [] as Array<string>;

    switch (uischema.type) {
        case 'Control':
            if ("scope" in uischema) {
                scopes.push(uischema.scope);
            }
            break;

        default:
            if ("elements" in uischema) {
                uischema.elements.forEach((elm: UISchemaElement) => scopes.push(...findAllScopes(elm)));
            }
            break;
    }

    return scopes;
};

export const findAllScopeTools = (uitool: ToolInterface, tools: ToolInterface[] = []): ToolInterface[] => {

    const schemaTools = uitool.childs.map(childTool => childTool?.uischema?.scope ? [childTool] : findAllScopeTools(childTool, tools))

    return [
        ...tools,
        ..._.flatten(schemaTools)
    ];
};

type Callback = (ref:URI) => JsonSchema|undefined;
export const resolveSchema = async (schema: any, callback:Callback|undefined = undefined): Promise<any> => {

    const resolver = new Resolver({
        resolvers: {
            file: {
                async resolve(ref: URI) {
                    return subschemaMap[String(ref)] ?? (callback && callback(ref)) ?? {}
                }
            },
        }
    });

    return await resolver.resolve(schema)
        .then(resolved => {
            if (resolved.errors.length) {
                throw resolved.errors.map(error => error.message);
                console.log("resolveSchema error", resolved.errors.map(error => error.message));
                return {}
            }
            return resolved.result
        })
}

export const confirmAndRemoveChild = (parentTool:ToolInterface, toolToDelete:ToolInterface) : Promise<{ removed:{element:ToolInterface,unscope?:boolean} }> => {
    return new Promise((resolve, reject) => {
        const { open, close} = useModal({
            component: ConfirmDelete,
            attrs: {
                tool: toolToDelete,
                onConfirm() {
                    parentTool.edge.removeChild(toolToDelete);

                    const isControl = 'Control' === toolToDelete?.uischema?.type;
                    if(!isControl) {
                        toolToDelete.edge.findScopedChilds().forEach(child => child.edge.uiParent = undefined);
                    }

                    resolve({removed:{element:toolToDelete}});

                    close();
                },
                onUnscope() {
                    parentTool.edge.removeChild(toolToDelete);
                    resolve({removed:{element:toolToDelete, unscope:true}});
                    close();
                }
            }
        })
        open();
    });
}


export const deleteToolInChilds = async (toolToDelete:ToolInterface|undefined = undefined, childTools:ToolInterface[] = []) : Promise<ToolInterface[]|boolean> => {

    const confirmed = window?.confirm ? window.confirm("Wirklich löschen?") : true;

    return await Promise.resolve(confirmed)
        .then((confirmed) => {
            if(confirmed) {
                return childTools.filter(childTool => childTool.uuid !== toolToDelete.uuid)
            }
            else {
                return false;
            }
        });
};

export const prepareAndCallOnDropAreaChange = (e:any, tool:ToolInterface, childs:ToolInterface[], onDropAreaChanged:any) => {

    /**
     * :INFO
     * store current childs in event, its necessary because of type=displaced check (that need old childs)
     */
    //add currentTool as parrent
    Object.keys(e).forEach(key => {
        e[key].parentTool = tool;               //as part of the event
        e[key].childs = childs;               //as part of the event

        // if(e[key].element) {
        //     e[key].element.parentTool = tool;       //attach to the current child
        // }
    });

    //add current childs
    //tool.childs = childs;

    //from fb?.exposed?.onDropAreaChanged(e);
    onDropAreaChanged(e);
}


export const findUnscopedTools = (baseSchemaTool:ToolInterface): ToolInterface[] => {
    return baseSchemaTool.edge.childs.filter((child) => {

        /**
         * :TODO go deeper recursivly for objects
         */
        return !child.edge.uiParent
    })
}
