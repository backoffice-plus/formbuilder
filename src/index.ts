import {controlTools, layoutTools} from "./lib/tools";


//lib
export * from './lib/formbuilder';
export {AbstractTool} from "./lib/tools/AbstractTool";
export type {ToolInterface, JsonFormsInterface} from "./lib/tools";
export const defaultTools = [...controlTools, ...layoutTools]

export { prepareOptionData as prepareOptionDataRule, setOptionData as setOptionDataRule } from './lib/tools/schema/rule'
export { prepareOptionData as prepareOptionDataLabel, setOptionData as setOptionDataLabel } from './lib/tools/schema/labelAndI18n'
export { prepareOptionData as prepareOptionDataValidation, setOptionData as setOptionDataValidation } from './lib/tools/schema/validation'

//components
export { default as FormBuilder } from './components/FormBuilder.vue';
export { default as FormBuilderBar } from './components/FormBuilderBar.vue';
export { default as FlexArea } from './components/tools/flexArea.vue'
export { default as ElementHeadOrToolIcon } from './components/tools/utils/ElementHeadOrToolIcon.vue'
export { default as ToolIcon } from './components/tools/utils/ToolIcon.vue'
export { default as Actions } from './components/tools/utils/Actions.vue'

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


export {default as Vuedraggable} from "../packages/_vuedraggable/src/vuedraggable.js";
