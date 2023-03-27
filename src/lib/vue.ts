import type {ComponentInternalInstance} from "@vue/runtime-core";
import {getCurrentInstance} from "vue";

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
