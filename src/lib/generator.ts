import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolFinderInterface, ToolInterface} from "./models";
import {findAllScopeTools} from "./formbuilder";

/** @deprecated **/
export const setRequiredToSchema = (propertyName: string, schema: JsonSchema, isRequired: boolean = false): void => {
    const plainProp = getPlainProperty(propertyName);
    let required = getRequiredFromSchema(propertyName, schema);
    if (isRequired) {
        if (!required.includes(plainProp)) {
            required.push(plainProp);
        }
    } else {
        if (required.includes(plainProp)) {
            required = required.filter((item: string) => item !== plainProp)
        }
    }
    _.set(schema, getRequiredPath(propertyName), required.length ? required : undefined)
}

/** @deprecated **/
export const setItemSchemaToSchema = (tool: ToolInterface, rootSchema: JsonSchema): void => {

    let set = tool.generateJsonSchema();
    if(undefined === set) {
        return
    }

    //console.log("setItemSchemaToSchema",tool,rootSchema);

    const subpaths = getAllSubpaths(tool.propertyName, 0);

    //create type=object in subpaths if not exists
    subpaths.forEach((subProp: string) => {
        const subPath = denormalizePath(subProp) + '.type'
        if (!_.get(rootSchema, subPath)) {
            _.set(rootSchema, subPath, 'object')
        }
    });

    let path = denormalizePath(tool.propertyName);

    // //array items :TODO find better implementation (its not working for multiple nested objects)
    // const isRef = undefined !== tool?.schema?.items?.$ref;
    // if('array' === tool?.schema?.type && undefined === tool?.schema?.items?.type && !isRef ) {
    //     set.items = {type:'object'}
    // }
    // if('array' === parentTool?.schema?.type) {
    //     path = path.replace(/^properties\./, 'items.properties.');
    // }

    _.set(rootSchema, path, set)

    if (tool.isRequired) {
        setRequiredToSchema(tool.propertyName, rootSchema, true);
    }
}

/** @deprecated **/
export const createJsonUiSchema = (tool: ToolInterface, baseSchemaTool: ToolInterface, rootSchema: JsonSchema, schemaReadOnly: boolean = false, toolFinder:ToolFinderInterface): JsonFormsUISchema => {
    if (_.isEmpty(tool.uischema.options)) {
        delete tool.uischema.options;
    }

    const uischema = tool.uischema;

    const clonedUischema = uischema && "type" in uischema && _.cloneDeep(uischema) as JsonFormsUISchema | any;
    const isScoped = clonedUischema && "scope" in clonedUischema;

    if(!isScoped) {
        if(tool.childs.length) {
            clonedUischema.elements = tool.childs.map((t: ToolInterface) => createJsonUiSchema(t, baseSchemaTool, rootSchema, schemaReadOnly, toolFinder)) ?? [];
        }
    }
    else if (!schemaReadOnly) {
       setItemSchemaToSchema(tool, rootSchema);
    }

    return clonedUischema;
};

export const handleEvent = (e:any, props:any, showBuilder:string, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder: ToolFinderInterface): {schema:JsonSchema|undefined, uischema:JsonFormsUISchema|undefined} => {

    let schema, uischema = undefined;

    switch (showBuilder) {
        case 'schema':
            schema = baseSchemaTool.generateJsonSchema();

            if(!props.schemaOnly) {
                const updated = handleEventAtSchemaBuilder(e, baseUiTool, baseSchemaTool, toolFinder)
                updated && (uischema = baseUiTool.generateUiSchema());
            }
            break;

        case 'uischema':
            uischema = baseUiTool.generateUiSchema();

            if(!props.schemaReadOnly) {
                const updated = handleEventAtUiBuilder(e, baseUiTool, baseSchemaTool, toolFinder);
                updated && (schema = baseSchemaTool.generateJsonSchema());
            }
            break;
    }

    return {schema, uischema}
}

export const handleEventAtSchemaBuilder = (e:any, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder: ToolFinderInterface):boolean => {

    if("removed" in e) {
        const schemaTool = e.removed.element as ToolInterface;
        const uischemaTool = schemaTool.uiTool;

        if(uischemaTool) {
            const parentTool = uischemaTool.parentTool ?? baseUiTool;
            if(parentTool) {
                parentTool.childs = parentTool.childs.filter(tool => tool.propertyName !== uischemaTool.propertyName);
                return true;
            }
        }
    }
    else if("modal" in e) {
        const schemaTool = e.modal.element as ToolInterface;
        const uischemaTool = schemaTool.uiTool;


        if(uischemaTool) {

            let set = schemaTool.generateJsonSchema();
            if(undefined === set) {
                return false
            }

            uischemaTool.schema = set;
            if(uischemaTool.propertyName !== schemaTool.propertyName) {
                uischemaTool.propertyName = schemaTool.propertyName ?? '';
                uischemaTool.uischema.scope = '#/properties/'+ schemaTool.propertyName;
            }

            return true;
        }
    }
    else {
        console.log("handleEventAtSchemaBuilder #:TODO for event:",e);
    }

    return false;
}

export const handleEventAtUiBuilder = (e:any, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder: ToolFinderInterface): boolean => {

    if("added" in e) {
        const uischemaTool = e.added.element as ToolInterface;
        const newIndex = e.added.newIndex;
        const isScoped = undefined !== uischemaTool.uischema.scope;

        return isScoped && generateOnAdded(uischemaTool, baseUiTool, baseSchemaTool, toolFinder);
    }
    else if("modal" in e) {
        const uischemaTool = e.modal.element;
        const isScoped = undefined !== uischemaTool.uischema.scope;

        return isScoped && generateOnModal(uischemaTool, baseUiTool, baseSchemaTool, toolFinder);

    }
    else if("removed" in e) {
        const uischemaTool = e.removed.element as ToolInterface;
        const isScoped = undefined !== uischemaTool.uischema.scope;
        if(!isScoped) {
            return false;
        }

        const parentTool = uischemaTool.parentTool?.scopeTool ?? baseSchemaTool;
        if(parentTool) {
            parentTool.childs = parentTool.childs.filter(tool => tool.propertyName !== uischemaTool.propertyName);
        }

        return true;

    }
    else if("mounted" in e) {
        const uischemaTool = e.mounted.element as ToolInterface;
        const isScoped = undefined !== uischemaTool.uischema.scope;
        if(!isScoped) {
            return false;
        }

        findAllScopeTools(uischemaTool).forEach(tool => {
            generateOnAdded(tool, baseUiTool, baseSchemaTool, toolFinder);
        })

        return true;
    }
    else if("moved" in e) {
        const uischemaTool = e.moved.element as ToolInterface;
        const oldIndex = e.moved.oldIndex;
        const newIndex = e.moved.newIndex;

        /**
         * :TODO
         * - move childs if parents is object and scoped to object (childs are not part of uischema)
         * - DONT move childs if parents is layout and childs is scoped
         */
        console.log("generateJsonSchemaByUi move #:TODO",e.moved);
    }
    else {
        console.log("generateJsonSchemaByUi #:TODO for event:",e);
    }


    return false
}


export const generateOnAdded = (uiTool: ToolInterface, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder:ToolFinderInterface): boolean => {

    // if(uiTool.parentTool) {
    //     let set = uiTool.parentTool.generateJsonSchema();
    //     if(undefined === set) {
    //         return
    //     }
    //     set = JSON.parse(JSON.stringify(set));
    //
    //     // const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    //     // schemaTool.childs = schemaTool.initChilds(toolFinder);
    //     uiTool.parentTool.childs = []; //reset for new initChilds
    //     uiTool.parentTool.childs = uiTool.parentTool.initChilds(toolFinder);
    //
    //     // let set = uiTool.parentTool.generateJsonSchema();
    //     // uiTool.parentTool.scopeTool.schema = set;
    //
    //     console.log("generateOnAdded","uiTool.parentTool",uiTool.parentTool)
    //     return;
    // }

    let parentTool = baseSchemaTool;
    if(uiTool?.parentTool?.scopeTool) {
        parentTool = uiTool.parentTool.scopeTool;
    }

    const propertyNames = parentTool.childs.map(tool => tool.propertyName);
    const toolExists = propertyNames.includes(uiTool.propertyName);

    if(toolExists) {
        return false
    }
    let set = uiTool.generateJsonSchema();
    if(undefined === set) {
        return false
    }

    const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    schemaTool.propertyName = uiTool.propertyName;
    schemaTool.childs = schemaTool.initChilds(toolFinder);
    schemaTool.parentTool = parentTool;

    uiTool.scopeTool = schemaTool;
    schemaTool.uiTool = uiTool;

    //:TODO for deep injection (eg: user.data.age)
    const path = '';

    parentTool.childs.push(schemaTool)

    return true;
}

export const generateOnModal = (uiTool: ToolInterface, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder:ToolFinderInterface): boolean => {

    let set = uiTool.generateJsonSchema();
    if(undefined === set) {
        return false
    }

    //const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    //schemaTool.propertyName = uiTool.propertyName;

    if(uiTool.scopeTool) {
        uiTool.scopeTool.schema = set;
        uiTool.scopeTool.propertyName = uiTool.propertyName;
    }

    return true;
};
