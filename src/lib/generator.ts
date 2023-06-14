import _ from "lodash";
import {Generate} from "@jsonforms/core";
import {denormalizePath, getAllSubpaths, getPlainProperty, getRequiredFromSchema, getRequiredPath} from "./normalizer";
import {CombinatorTool} from "./tools/combinatorTool";
import type {JsonSchema} from "@jsonforms/core";
import type {JsonFormsInterface, JsonFormsUISchema, ToolFinderInterface, ToolInterface} from "./models";
import {findAllScopeTools} from "./formbuilder";
import type {BuilderEvent} from "./BuilderEvent";

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

export const handleEvent = (event: BuilderEvent): JsonFormsInterface => {

    let schema, uischema = undefined;

    /**
     * replace latest childs to the current parents (both comes from prepareAndCallOnDropAreaChange)
     */
    if (event.parentTool && event.childs) {
        event.parentTool.edge.replaceChilds(event.childs);
    }

    if('mounted' === event.type) {
        event.tool.edge.childsInitialized = true;
    }

    switch (event.showBuilder) {
        case 'schema':
            schema = event.baseSchemaTool?.generateJsonSchema();

            if(!event.schemaOnly) {
                const updated = handleSchemaEvent(event)
                updated && (uischema = event.baseUiTool?.generateUiSchema());
            }
            break;
            
        case 'uischema':
            uischema = event.baseUiTool?.generateUiSchema();

            if(!event.schemaReadOnly) {
                const updated = handelUiEvent(event);
                updated && (schema = event.baseSchemaTool?.generateJsonSchema());
            }
            break;
    }

    return {schema, uischema} as JsonFormsInterface
}

export const handleSchemaEvent = (event: BuilderEvent): boolean => {

    const schemaTool = event.tool;
    const uiParent = event.parentTool;

    const isScoped = undefined !== schemaTool.uischema.scope;
    const isParentScoped = undefined !== uiParent?.uischema?.scope;
    const isControl = 'Control' === schemaTool.uischema.type;

    //console.log("handleSchemaEvent", event.type, {scoped: isScoped, parentScoped: isParentScoped}, event);

    switch (event.type) {

        // case 'added':
        //     return (isScoped || isParentScoped) && handelSchemaEventOnAdded(event);
        //
        case 'removed':
            return handelSchemaEventOnRemoved(event)

        case 'modal':
                /**
                 * :INFO must be true if propertyName has changed (creates a new scope)
                 * but there is no propertyNameHasChangedcheck right now
                 */
                 return true;

        case 'moved':
            const oldIndex = event.oldIndex;
            const newIndex = event.newIndex;

            /**
             * :TODO
             * - move childs if parents is object and scoped to object (childs are not part of uischema)
             * - update parentTool
             * - DONT move childs if parents is layout and childs is scoped
             */
            console.log("handleSchemaEvent #:TODO for ", event.type, event);
            break;
        //
        // default:
        //     //console.log("handleSchemaEvent #:TODO for ",event.type, event);
        //     break;
    }


    return false;
}

export const handelUiEvent = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const uiParent = event.parentTool;

    const isScoped = undefined !== uiTool.uischema.scope;
    const isControl = 'Control' === uiTool.uischema.type;

    switch (event.type) {
        case 'added':
            uiTool.edge.uiParent = uiParent;
            return uiTool.edge.exUiParent ? handelUiEventOnDisplaced(event) : handelUiEventOnAdded(event);

        case 'removed':
            const displaced = uiTool.edge.displaced
            if(displaced) {
                uiTool.edge.displaced = undefined;
            }
            return !displaced && handleUiEventOnRemoved(event);

        case 'mounted':
            if (!isControl) {
                const controlChilds = uiTool.edge.childs.filter(child => 'Control' === child.uischema.type)
                controlChilds.forEach(tool => {
                    handelUiEvent(event.createSubevent({added: {element: tool, parentTool:uiTool}}));
                })
                return true;
            }
            break;

        case 'modal':
            return isControl && handleUiEventOnModal(event);

        case 'moved':
            // const oldIndex = event.oldIndex;
            // const newIndex = event.newIndex;

            /**
             * :TODO
             * - move childs if parents is object and scoped to object (childs are not part of uischema)
             * - DONT move childs if parents is layout and childs is scoped
             */
            console.log("handelUiEvent move #:TODO", uiTool);
            break;

        default:
            console.log("handelUiEvent #:TODO for event:", event);
            break;
    }

    return false
}

export const handelSchemaEventOnAdded = (event: BuilderEvent): boolean => {

    const schemaTool = event.tool;
    const schemaParent = event.parentTool;

    schemaTool.edge.schemaParent = schemaParent;

    //:TODO for deep injection (eg: user.data.age)
    const path = '';
    const parentUiTool = null ?? event.baseUiTool;
    // if (parentUiTool) {
    //     schemaTool.parentUiTool = parentUiTool
    //     parentUiTool?.childs.push(schemaTool)
    // }

    // const parentBiTool = event?.parentTool?.biTool
    // if(!parentBiTool) {
    //     throw "parent BiTool is empty";
    // }

    //const schemaTool = event.toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    // const biTool = schemaTool.clone();
    // biTool.uuid;
    // biTool.propertyName = schemaTool.propertyName;
    // biTool.childs = schemaTool.initChilds(event.toolFinder);
    // biTool.parentTool = parentBiTool;
    // //schemaTool.uischema = uiTool.uischema;
    // biTool.setBiTool(schemaTool)


    return true;
}
export const handelSchemaEventOnRemoved = (event: BuilderEvent): boolean => {

    const schemaTool = event.tool;
    const uiParent = schemaTool.edge.uiParent;
    const schemaParent = schemaTool.edge.schemaParent;

    const hasSchemaParent = undefined !== schemaParent

    let removed = false;
    if (hasSchemaParent && uiParent) {
        uiParent.edge.removeChild(schemaTool);
        removed = true;
    }

    return removed;
}

export const handelUiEventOnAdded = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const uiParent = event.parentTool;

    const isControl = 'Control' === uiTool?.uischema.type;
    const isParentControlType = 'Control' === uiParent?.uischema.type;

    //:TODO for deep injection (eg: user.data.age)
    // const scope = uiTool.uischema.scope;
    // const pathSegments = scope && toDataPathSegments(scope)
    // const propertyName = pathSegments?.pop();

    let scenario, targetTool;
    if(!isControl) {
        scenario = 'add.Layout->Layout'
    }
    else if (isParentControlType) {
        scenario = 'add.Control->Object'
    }
    else {
        scenario = 'add.Control->Layout'
        targetTool = event.baseSchemaTool;
    }

    //console.log("handelUiEventOnAdded", {
    //     event,
    //     scenario,
    //     targetTool,
    //     edge: uiTool.edge,
    // });

    let added = false;
    if (targetTool) {
        targetTool?.edge.addChild(uiTool, event.newIndex);
        uiTool.edge.schemaParent = targetTool;

        added = true;
    }

    return added;
}
export const handelUiEventOnDisplaced = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const uiParent = event.parentTool;

    const exUiParent = uiTool.edge.exUiParent;
    const exSchemaParent = uiTool.edge.exSchemaParent;
    const isControl = 'Control' === uiTool?.uischema.type; //:TODO find better solution?!
    const isParentControlType = 'Control' === uiParent?.uischema.type; //:TODO find better solution?!
    const isScoped = undefined !== uiParent?.uischema?.scope;
    const isExScoped = undefined !== exUiParent?.uischema?.scope
    const isExControl = 'Control' === exUiParent?.uischema?.type

    //:TODO for deep injection (eg: user.data.age)
    // const scope = uiTool.uischema.scope;
    // const pathSegments = scope && toDataPathSegments(scope)
    // const propertyName = pathSegments?.pop();
    // const parentSchemaTool = undefined ?? event.baseSchemaTool;

    let scenario;
    const targets = {add:undefined, del:undefined} as {add:ToolInterface|undefined,del:ToolInterface|undefined};

    if(isExControl && !isScoped && isExScoped) {
        scenario = 'Object->Layout'
        targets.add = event.baseSchemaTool
        targets.del = uiTool.edge.exUiParent;
    }
    else if(isExControl && isScoped && isExScoped) {
        scenario = 'Object->Object'
        targets.add = event.parentTool;
        targets.del = uiTool.edge.exUiParent;
    }
    else if(!isExControl && isScoped && !isExScoped) {
        scenario = 'Layout->Object'
        targets.add = event.parentTool;
        targets.del = uiTool.edge.schemaParent
    }
    else if(!isExControl && !isScoped && !isExScoped) {
        scenario = 'Layout->Layout'
    }

    // console.log("handelUiEventOnDisplaced", {
    //     event,
    //     scenario,
    //     targets,
    //     edge: uiTool.edge,
    // });

    let displaced = false;
    if (targets.add && targets.del) {
        targets.add.edge.addChild(uiTool, event.newIndex);
        targets.del.edge.removeChild(uiTool);

        uiTool.edge.schemaParent = targets.add;
        uiTool.edge.exUiParent = undefined;
        uiTool.edge.exSchemaParent = undefined;

        displaced = true;
    }

    //must always be true to avoid handleUiEventOnRemoved()
    uiTool.edge.displaced = true;

    return displaced;
}
export const handleUiEventOnModal = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;

    let set = uiTool.generateJsonSchema();
    if (undefined === set) {
        return false
    }

    //const schemaTool = toolFinder.findMatchingToolAndClone({}, set, {type: 'Control', scope: '#'});
    //schemaTool.propertyName = uiTool.propertyName;

    // if(uiTool.biTool) {
    //     uiTool.biTool.schema = set;
    //     uiTool.biTool.propertyName = uiTool.propertyName;
    // }

    return true;
};
export const handleUiEventOnRemoved = (event: BuilderEvent): boolean => {
    const uiTool = event.tool;

    const schemaParent = uiTool.edge.schemaParent;

    let removed = false;
    if (schemaParent) {
        schemaParent.edge.removeChild(uiTool);
        removed = true;
    }
    return removed;
};
