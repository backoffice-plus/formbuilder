import {controlTools, layoutTools} from "./lib/tools";

export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

//lib
export * from './lib/formbuilder';
export {Tool, updatableUischemaKeys, updatableSchemaKeys} from "./lib/models";
export type {ToolInterface, JsonFormsInterface} from "./lib/models";
export const defaultTools = [...controlTools, ...layoutTools]

//components
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FlexArea } from './components/tools/flexArea.vue'

//jsonForms Renderer
import {vanillaRenderers} from "@jsonforms/vue-vanilla";
import {entry as tabsCategorizationRenderer} from "../packages/boplus-vue-vanilla/src/components/TabsCategorizationRenderer.vue";
import {entry as oneOfRenderer} from "../packages/boplus-vue-vanilla/src/components/OneOfRenderer.vue";
import {entry as allOfRenderera} from "../packages/boplus-vue-vanilla/src/components/AllOfRenderer.vue";
import {entry as anyOfRenderer} from "../packages/boplus-vue-vanilla/src/components/AnyOfRenderer.vue";
import {entry as objectRenderer} from "../packages/boplus-vue-vanilla/src/components/ObjectRenderer.vue";
import {entry as arrayControlRenderer} from "../packages/boplus-vue-vanilla/src/components/ArrayControlRenderer.vue";
import {entry as enumArrayRenderer} from "../packages/boplus-vue-vanilla/src/components/EnumArrayRenderer.vue";
export const jsonFormRenderes = Object.freeze([
    ...vanillaRenderers,
    tabsCategorizationRenderer,
    oneOfRenderer,
    allOfRenderera,
    anyOfRenderer,
    objectRenderer,
    arrayControlRenderer,
    enumArrayRenderer,
]);

export {emitter} from './lib/mitt'
