import type {JsonFormsInterface, ToolInterface} from "./models";
import type {BuilderEvent} from "./BuilderEvent";

export const generateJsonForm = (event: BuilderEvent): JsonFormsInterface => {

    let schema, uischema = undefined;

    if('mounted' === event.type) {
        event.tool.edge.childsInitialized = true;
    }

    switch (event.showBuilder) {
        case 'schema':
            schema = event.baseSchemaTool?.generateJsonSchema();

            if(!event.schemaOnly) {
                const updated = updateUiTree(event)
                updated && (uischema = event.baseUiTool?.generateUiSchema());
            }
            break;

        case 'uischema':
            uischema = event.baseUiTool?.generateUiSchema();

            // deleting a child (type=control) in a type=control (object, array, combinator)
            const isParentControl = 'Control' === event.parentTool?.uischema.type;
            if(isParentControl) {
                schema = event.baseSchemaTool?.generateJsonSchema();
            }

            if(!event.schemaReadOnly) {
                const updated = updateSchemaTree(event);
                updated && (schema = event.baseSchemaTool?.generateJsonSchema());
            }
            break;
    }

    return {schema, uischema} as JsonFormsInterface
}

const updateUiTree = (event: BuilderEvent): boolean => {

    const schemaTool = event.tool;
    const schemaParent = event.parentTool;

    const isScoped = undefined !== schemaTool.uischema.scope;
    const isParentScoped = undefined !== schemaParent?.uischema?.scope;
    const isControl = 'Control' === schemaTool.uischema.type;

    //console.log("handleSchemaEvent", event.type, {scoped: isScoped, parentScoped: isParentScoped}, event);

    switch (event.type) {

        case 'added':
            schemaTool.edge.schemaParent = schemaParent;
            //return (isScoped || isParentScoped) && handelSchemaEventOnAdded(event);
            break;

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
const updateSchemaTree = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const isControl = 'Control' === uiTool.uischema.type;

    switch (event.type) {
        case 'added':
            return event.displaceType ? handelUiEventOnDisplaced(event) : handelUiEventOnAdded(event);

        case 'removed':
            const wasDisplaced = !!uiTool.edge.displaced;
            if(uiTool.edge.displaced) {
                uiTool.edge.displaced = undefined;
            }

            let update = !wasDisplaced ? handleUiEventOnRemoved(event) : false;

            // deleting a child (type=control) in a type=control (object, array, combinator) at builder=uischema
            if(!update) {
                const isParentControl = 'Control' === event.parentTool?.uischema.type;
                if(isParentControl) {
                    update = true;
                }
            }

            return update

        case 'mounted':
            if (!isControl) {
                // const controlChilds = uiTool.edge.childs.filter(child => 'Control' === child.uischema.type)
                // controlChilds.forEach(tool => {
                //     updateSchemaTree(event.createSubevent({added: {element: tool, parentTool:uiTool}}));
                // })
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

const handelSchemaEventOnAdded = (event: BuilderEvent): boolean => {

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
const handelSchemaEventOnRemoved = (event: BuilderEvent): boolean => {

    const schemaTool = event.tool;
    const uiParent = schemaTool.edge.uiParent;
    const schemaParent = schemaTool.edge.schemaParent;

    const hasSchemaParent = undefined !== schemaParent

    let removed = false;
    if (uiParent) { //hasSchemaParent &&
        uiParent.edge.removeChild(schemaTool);
        removed = true;
    }

    return removed;
}

const handelUiEventOnAdded = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const uiParent = event.parentTool;

    const isControl = 'Control' === uiTool?.uischema.type;
    const isParentControlType = 'Control' === uiParent?.uischema.type;

    //:TODO for deep injection (eg: user.data.age)
    // const scope = uiTool.uischema.scope;
    // const pathSegments = scope && toDataPathSegments(scope)
    // const propertyName = pathSegments?.pop();

    let added = false;

    let scenario, targetTool;
    if(!isControl) {
        scenario = 'add.Layout->Layout'
    }
    else if (isParentControlType) {
        scenario = 'add.Control->Object'
        added = true; //is already child in a schema - so just return true to render schema
    }
    else {
        scenario = 'add.Control->Layout'
        targetTool = event.baseSchemaTool;
    }

    /**
     * Eventhandler per Tool
     * :TODO finalize it -> move logic from here to each tool (or abstract tool)
     */
    if("handelUiEventOnAdded" in event.tool) {
        const e = {event, targetTool}
        //@ts-ignore
        event.tool?.handelUiEventOnAdded(e);
        "targetTool" in e && (targetTool = e.targetTool);
    }

    if (targetTool) {
        targetTool?.edge.addChild(uiTool, event.newIndex);
        //uiTool.edge.uiParent = uiParent;
        //uiTool.edge.schemaParent = targetTool;

        added = true;
    }

    return added;
}
const handelUiEventOnDisplaced = (event: BuilderEvent): boolean => {

    const uiTool = event.tool;
    const parentTool  = event.parentTool;
    const exUiParent = event.exParents.uiParent;
    const exSchemaParent = event.exParents.schemaParent;

    //:TODO for deep injection (eg: user.data.age)

    const targets = {
        add:undefined as ToolInterface|undefined,
        del:undefined as ToolInterface|undefined,
        uiParent:undefined as ToolInterface|undefined|null,
    };

    switch (event.displaceType) {
        case 'object->layout':
            targets.add = event.baseSchemaTool;
            targets.del = exSchemaParent;
            targets.uiParent = parentTool;
            break;
        case 'object->object':
            targets.add = parentTool;
            targets.del = exSchemaParent;
            break;

        case 'layout->object':
            targets.add = parentTool;
            targets.del = event.baseSchemaTool;
            targets.uiParent = null;
            break;
        case 'layout->layout':
            uiTool.edge.displaced = parentTool;
            break;
    }

    // console.log("handelUiEventOnDisplaced", {
    //     event,
    //     scenario: event.displaceType,
    //     targets,
    //     edge: uiTool.edge,
    //     exUiParent: uiTool.edge.uiParent?.uuid,
    //     exSchemaParent: uiTool.edge.schemaParent?.uuid,
    // });

    let displaced = false;
    if (targets.add || targets.del) {
        targets.del && (targets.del.edge.removeChild(uiTool));
        targets.add && (targets.add.edge.addChild(uiTool, event.newIndex));

        undefined !== targets.uiParent && (uiTool.edge.uiParent = targets.uiParent??undefined);

        displaced = true;
        uiTool.edge.displaced = targets.add;
    }

    return displaced;
}
const handleUiEventOnModal = (event: BuilderEvent): boolean => {

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
const handleUiEventOnRemoved = (event: BuilderEvent): boolean => {
    const uiTool = event.tool;
    const schemaParent = event.exParents.schemaParent;

    //const hasExParents = schemaParent?.uuid && schemaParent?.uuid === uiTool.edge.displaced?.uuid;
    const wasDisplaced = schemaParent?.uuid && schemaParent?.uuid === uiTool.edge.displaced?.uuid;

    let removed = false;
    if(event.unscope) {
        uiTool.edge.uiParent = undefined;
    }
    else if (schemaParent) {
        schemaParent.edge.removeChild(uiTool);
        removed = true;
    }
    return removed;
};
