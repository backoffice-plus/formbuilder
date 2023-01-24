import {shallowRef} from "vue";
import formInputByType from "../../components/tools/formInputByType.vue";
import flexArea from "../../components/tools/flexArea.vue";
import categorization from "../../components/tools/categorization.vue";
import label from "../../components/tools/label.vue";
import reference from "../../components/tools/reference.vue";
import combinatorAsTabs from "../../components/tools/combinatorAsTabs.vue";
import unknown from "../../components/tools/unknown.vue";

export const getComponent = (componentName:string, useShallowRef:boolean|undefined = false) => {
    const asShallowRef = (e:any) => {
        return useShallowRef ? shallowRef(e) : e;
    }

    if('categorization' === componentName) {
        return asShallowRef(categorization);
    }
    else if('formInputByType' === componentName) {
        return asShallowRef(formInputByType);
    }
    else if('label' === componentName) {
        return asShallowRef(label);
    }
    else if('reference' === componentName) {
        return asShallowRef(reference);
    }
    else if('combinatorAsTabs' === componentName) {
        return asShallowRef(combinatorAsTabs);
    }
    else if('unknown' === componentName) {
        return asShallowRef(unknown);
    }
    else {
        return asShallowRef(flexArea);
    }
}

// export const importAsyncComponent = (componentName:string) => {
//     if('categorization' === componentName) {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/categorization.vue"))
//     }
//     else if('formInputByType' === componentName) {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/formInputByType.vue"))
//     }
//     else {
//         return defineAsyncComponent(() => import("~/lib/formbuilder/components/tools/flexArea.vue"))
//     }
// }
