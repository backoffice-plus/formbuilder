import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {entry as fileRenderer} from "./FileControlRenderer.vue";
import {entry as tabsCategorizationRenderer} from "./TabsCategorizationRenderer.vue";

export const jsonFormRenderes = Object.freeze([
    ...vanillaRenderers,
    fileRenderer,
    tabsCategorizationRenderer,
]);
