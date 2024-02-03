import {getCurrentInstance} from "vue";
import type {Ref, ComponentInternalInstance} from "vue";
import type {ToolFinder} from "./ToolFinder";
import type {ToolInterface, ToolContext, BuilderType, BuilderModeType} from "./models";
import {BuilderMode} from "@/lib/formbuilder";

export const getFormbuilder = () : ComponentInternalInstance|null => {
    let instance = getCurrentInstance();
    return instance && findFormbuilder(instance);
}

export const findFormbuilder = (instance:ComponentInternalInstance) : ComponentInternalInstance|null => {
    if('FormBuilder' === instance.type.__name) {
        return instance
    }
    else {
        return instance.parent ? findFormbuilder(instance.parent) : null;
    }
}

export const getToolfinder = (): ToolFinder | undefined => {
    return getFormbuilder()?.exposed?.toolFinder
}

export const getToolDraggingRef = (): Ref<ToolInterface | undefined> => {
    return getFormbuilder()?.exposed?.toolDragging;
}
export const getToolDragging = (): ToolInterface | undefined => {
    return getToolDraggingRef()?.value;
}
export const onDragGetTool = (e:any) : ToolInterface => {
    const isDragging = 'start' === e?.type;
    return isDragging && e?.item?._underlying_vm_;
}

export const createContext = (fb:any):ToolContext => {
    const builderType:BuilderType = fb?.exposed?.showBuilder.value;
    const schemaOnly= !!fb?.props?.schemaOnly;
    const schemaReadOnly= !!fb?.props?.schemaReadOnly;

    let builderMode:BuilderModeType = BuilderMode.SCHEMA;
    if('uischema' === builderType) {
        builderMode = BuilderMode.UI;
        if(!schemaReadOnly) {
            builderMode = BuilderMode.BOTH
        }
    }

    const isBuilderMode:Record<BuilderType, boolean> = {
        schema: 0 !== (builderMode & BuilderMode.SCHEMA),
        uischema: 0 !== (builderMode & BuilderMode.UI),
    }

    return {
        fb: fb,
        builderMode,
        isBuilderMode,
        builder: builderType,
        schemaOnly: schemaOnly,
        schemaReadOnly: schemaReadOnly,
        rootSchema: fb?.exposed?.rootSchema?.value,
        baseSchemaTool: fb?.exposed?.baseSchemaTool?.value,
    } as ToolContext
}

// export const onDrag = (e:any) : void => {
//     const toolDragging = getFormbuilder()?.exposed?.toolDragging;
//     console.log("toolDragging",getFormbuilder());
//     if(toolDragging) {
//         toolDragging.value = onDragGetTool(e);
//     }
// }
//
// export const __onDrag = (e:any) : void => {
//     const isDragging = 'start' === e?.type;
//     const tool = e?.item?._underlying_vm_;
//
//     //console.log("onDrag",tool);
//     console.log("onDrag","getFormbuilder",getFormbuilder());
//
//     const toolDragging = getFormbuilder()?.exposed?.toolDragging;
//     toolDragging.value = isDragging && tool ? tool : undefined;
// };
