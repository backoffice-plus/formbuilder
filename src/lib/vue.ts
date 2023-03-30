import type {ComponentInternalInstance} from "@vue/runtime-core";
import {getCurrentInstance} from "vue";
import type {ToolFinder} from "./ToolFinder";

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
