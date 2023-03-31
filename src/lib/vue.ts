import type {ComponentInternalInstance} from "@vue/runtime-core";
import {getCurrentInstance} from "vue";
import type {Ref} from "vue";
import type {ToolFinder} from "./ToolFinder";
import type {ToolInterface} from "./tools";

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
