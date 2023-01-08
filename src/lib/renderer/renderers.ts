import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import fileRenderer from "./FileControlRenderer.vue";
import tabsCategorizationRenderer from "./TabsCategorizationRenderer.vue";

export const jsonFormRenderes = Object.freeze([
    ...vanillaRenderers,
    fileRenderer,
    tabsCategorizationRenderer,
]);
