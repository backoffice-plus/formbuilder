import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolFinderInterface, ToolInterface} from "./models";

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

export const generateJsonSchemaByUi = (e:any, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder: ToolFinderInterface): JsonSchema => {

    let rootSchema;

    const schema = baseSchemaTool.generateJsonSchema();

    if("added" in e) {
        const uischemaTool = e.added.element;
        const newIndex = e.added.newIndex;

        generateOnAdded(uischemaTool, baseUiTool, baseSchemaTool, toolFinder);

        rootSchema = baseSchemaTool.generateJsonSchema();
    }
    else if("modal" in e) {
        const uischemaTool = e.modal.element;

        generateOnModal(uischemaTool, baseUiTool, baseSchemaTool, toolFinder);

        rootSchema = baseSchemaTool.generateJsonSchema();

    }
    else {
        console.log("generateJsonSchemaByUi #:TODO for event:",e);
        rootSchema = schema;
       // rootUischema.value = createJsonUiSchema(baseUiTool.value, baseSchemaTool.value, schema, props.schemaReadOnly, toolFinder);
    }

    if(undefined === rootSchema) {
        rootSchema = {};
    }

    return rootSchema
}


export const generateOnAdded = (uiTool: ToolInterface, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder:ToolFinderInterface) => {

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


    let set = uiTool.generateJsonSchema();
    if(undefined === set) {
        return
    }

    set = JSON.parse(JSON.stringify(set));

    const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    schemaTool.propertyName = uiTool.propertyName;

    uiTool.scopeTool = schemaTool;
    schemaTool.uiTool = uiTool;

    //:TODO for deep injection (eg: user.data.age)
    const path = '';


    let parentTool = baseSchemaTool;
    if(uiTool?.parentTool?.scopeTool) {
        parentTool = uiTool.parentTool.scopeTool;
    }

    parentTool.childs.push(schemaTool)
}

export const generateOnModal = (uiTool: ToolInterface, baseUiTool: ToolInterface, baseSchemaTool: ToolInterface, toolFinder:ToolFinderInterface) => {

    let set = uiTool.generateJsonSchema();
    if(undefined === set) {
        return
    }

    console.log("generateOnModal", set)

    //const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    //schemaTool.propertyName = uiTool.propertyName;

    if(uiTool.scopeTool) {
        uiTool.scopeTool.schema = set;
        uiTool.scopeTool.propertyName = uiTool.propertyName;
    }
};
